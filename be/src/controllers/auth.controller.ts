import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  hashPassword, 
  verifyPassword, 
  generateTokens, 
  refreshAccessToken,
  revokeRefreshToken
} from '../utils/auth';
import { env } from '../config/env';

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
      res.status(409).json({ message: 'User already exists with this email' });
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
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'lax',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      path: '/api/auth/refresh', // Only send cookie to refresh endpoint
    });

    // Return user data (excluding sensitive information)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * User login controller
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
    return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
    return;
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'lax',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      path: '/api/auth/refresh', // Only send cookie to refresh endpoint
    });

    // Return user data (excluding sensitive information)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Token refresh controller
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token required' });
    return;
    }

    // Generate new access token
    const accessToken = await refreshAccessToken(refreshToken);
    
    if (!accessToken) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    return;
    }

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.isProduction(),
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'lax',
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
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
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * Get current user controller
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

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
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error getting current user' });
  }
};
