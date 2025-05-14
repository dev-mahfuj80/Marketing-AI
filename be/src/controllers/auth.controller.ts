import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../utils/email.js";
import type { AuthenticatedRequest } from "../types/express.js";
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
} from "../utils/auth.js";
import { env } from "../config/env.js";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * User registration controller
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const tokens = await generateTokens(user);

    // Set cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "lax",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
      path: "/api/auth/refresh", // Only send cookie to refresh endpoint
    });

    // Return user data (excluding sensitive information)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
    return;
  }
};

/**
 * User login controller
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);
    
    // Check if tables exist first
    try {
      // Test database connection
      const tableCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `;
      console.log('Table check result:', tableCheck);
    } catch (dbError) {
      console.error('Database check error:', dbError);
      res.status(500).json({ message: 'Database connection error' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    // Set cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "lax",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
      path: "/api/auth/refresh", // Only send cookie to refresh endpoint
    });
    console.log(user);
    // Return user data (excluding sensitive information)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: "Please verify your email first" });
    return;
  }
};

/**
 * Token refresh controller
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(400).json({ message: "No refresh token provided" });
      return;
    }

    // Generate new access token
    const accessToken = await refreshAccessToken(refreshToken);

    if (!accessToken) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: "Server error during token refresh" });
    return;
  }
};

/**
 * Logout controller
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Revoke refresh token from database if it exists
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
    return;
  }
};

/**
 * Get current user controller
 */
/**
 * Request password reset
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      } as any, // Type assertion needed until Prisma client is regenerated
    });

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
      return;
    }

    // Find user by token and check expiration
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      } as any, // Type assertion needed until Prisma client is regenerated
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      } as any, // Type assertion needed until Prisma client is regenerated
    });

    // Invalidate all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password.",
    });
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        facebookToken: true,
        linkedInToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
