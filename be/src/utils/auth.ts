import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import { env } from "../config/env";

const prisma = new PrismaClient();

// Types
interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate a hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verify if password matches the hashed password
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const signOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY
  };
  return jwt.sign(payload, env.JWT_SECRET, signOptions);
};

/**
 * Generate JWT refresh token and save to database
 */
export const generateRefreshToken = async (
  payload: TokenPayload
): Promise<string> => {
  const signOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY
  };
  const token = jwt.sign(payload, env.JWT_SECRET, signOptions);

  // Calculate expiry date
  const expiryDays = parseInt(env.JWT_REFRESH_EXPIRY) || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token,
      userId: payload.userId,
      expiresAt,
    },
  });

  return token;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = async (user: User): Promise<TokenResponse> => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as string,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    // Verify the refresh token is valid
    const payload = verifyToken(refreshToken);
    if (!payload) return null;

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token expired or not found
      return null;
    }

    // Generate a new access token
    return generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role as string,
    });
  } catch (error) {
    return null;
  }
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
    return true;
  } catch (error) {
    return false;
  }
};
