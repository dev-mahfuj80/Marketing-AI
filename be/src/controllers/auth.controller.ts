import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/express.js";
import { refreshAccessToken, revokeRefreshToken } from "../utils/auth.js";
import { env } from "../config/env.js";
import { AuthService } from "../services/auth.service.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Call the service
    const result = await AuthService.register(name, email, password);

    // Handle error cases
    if (!result.success) {
      res.status(result.status || 500).json({ message: result.message });
      return;
    }

    // Set cookies
    res.cookie("accessToken", result?.tokens?.accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "lax",
    });

    res.cookie("refreshToken", result?.tokens?.refreshToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
      path: "/api/auth/refresh", // Only send cookie to refresh endpoint
    });

    // Return success response
    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      accessToken: result?.tokens?.accessToken,
    });
  } catch (error) {
    console.error("Registration controller error:", error);
    res.status(500).json({
      message: "An error occurred during registration. Please try again.",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Call the service
    const result = await AuthService.login(email, password);

    // Handle error cases
    if (!result.success) {
      res.status(result.status || 500).json({
        message: result.message,
        code: result.code,
      });
      return;
    }

    // Set cookies
    res.cookie("accessToken", result?.tokens?.accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 600 * 60 * 1000, // 10 minutes
      sameSite: "lax",
    });

    res.cookie("refreshToken", result?.tokens?.refreshToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 70 * 24 * 60 * 60 * 1000, // 70 days
      sameSite: "lax",
      path: "/api/auth/refresh", // Only send cookie to refresh endpoint
    });

    // Return success response
    res.status(200).json({
      message: "Login successful",
      user: result.user,
      accessToken: result?.tokens?.accessToken,
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({
      message: "An error occurred during login. Please try again.",
    });
  }
};

// Token refresh controller
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
      maxAge: 150 * 60 * 1000, // 15 minutes
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

// Logout controller
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

// Request password reset controller
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await AuthService.requestPasswordReset(email);

    if (result.status) {
      res.status(result.status).json(result);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error("Error in requestPasswordReset controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

// Reset password with token
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);

    if (result.status) {
      res.status(result.status).json(result);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password.",
    });
  }
};

// Get current user controller
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const result = await AuthService.getUserById(req.user.id);

    if (!result.success) {
      res.status(result.status || 500).json({ message: result.message });
      return;
    }

    res.status(200).json({ user: result.user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user controller
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const result = await AuthService.updateUser(req.user.id, req.body);

    if (!result.success) {
      res.status(result.status || 500).json({ message: result.message });
      return;
    }

    res.status(200).json({ user: result.user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
