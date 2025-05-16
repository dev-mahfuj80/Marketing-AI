import type { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { SignOptions } from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Generate JWT tokens for authentication
 */
const generateTokens = (userId: string) => {
  // Create access token
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as SignOptions);

  // Create refresh token
  const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  } as SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Handle Facebook OAuth callback for login
 */
export const facebookAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== "login") {
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=Invalid callback parameters`
      );
    }

    // Debug logs to help diagnose the OAuth flow
    console.log("Facebook Auth Debug - Query params:", req.query);
    console.log(
      "Facebook Auth Debug - REDIRECT_URI env var:",
      env.REDIRECT_URI
    );

    // Use a simplified redirect URI approach - try different formats
    // IMPORTANT: Make sure this EXACT URI is registered in Facebook Developer Console
    const redirectUri = "http://localhost:5000/api/auth/callback/facebook";
    console.log(
      "Facebook Auth Debug - Using hardcoded redirect URI:",
      redirectUri
    );

    // Also log additional debug info
    console.log("Facebook Auth Debug - App ID:", env.FACEBOOK_APP_ID);
    // Don't log the full app secret for security, just the first few chars
    console.log(
      "Facebook Auth Debug - App Secret (first 4 chars):",
      env.FACEBOOK_APP_SECRET.substring(0, 4)
    );

    // Exchange code for access token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token`,
      {
        params: {
          client_id: env.FACEBOOK_APP_ID,
          client_secret: env.FACEBOOK_APP_SECRET,
          redirect_uri: redirectUri,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile from Facebook
    const profileResponse = await axios.get(
      "https://graph.facebook.com/v19.0/me",
      {
        params: {
          fields: "id,name,email",
          access_token,
        },
      }
    );

    const { id: facebookId, name, email } = profileResponse.data;

    if (!email) {
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=Email not provided by Facebook`
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          // Generate a random secure password for the account
          password: crypto.randomBytes(16).toString("hex"),
          // Use Prisma.UserCreateInput type casting for custom fields
          facebookId: facebookId.toString(),
          facebookToken: access_token,
        } as Prisma.UserCreateInput,
      });
    } else {
      // Update existing user with Facebook data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          facebookId: facebookId.toString(),
          facebookToken: access_token,
        } as Prisma.UserUpdateInput,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id.toString());

    // Set cookies
    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to dashboard
    return res.redirect(
      `${env.FRONTEND_URL}/dashboard?auth=facebook&status=success`
    );
  } catch (error) {
    console.error("Facebook Auth Error:", error);
    return res.redirect(
      `${env.FRONTEND_URL}/login?error=Authentication failed&provider=facebook`
    );
  }
};

/**
 * Handle LinkedIn OAuth callback for login
 */
export const linkedinAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== "login") {
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=Invalid callback parameters`
      );
    }

    const redirectUri = `${env.REDIRECT_URI}/linkedin`;

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile from LinkedIn
    const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Get user email from LinkedIn
    const emailResponse = await axios.get(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const linkedinId = profileResponse.data.id;
    const name = `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`;
    const email = emailResponse.data.elements[0]["handle~"].emailAddress;

    if (!email) {
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=Email not provided by LinkedIn`
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          // Generate a random secure password for the account
          password: crypto.randomBytes(16).toString("hex"),
          // Use Prisma.UserCreateInput type casting for custom fields
          linkedinId: linkedinId.toString(),
          linkedInToken: access_token,
        } as Prisma.UserCreateInput,
      });
    } else {
      // Update existing user with LinkedIn data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedinId: linkedinId.toString(),
          linkedInToken: access_token,
        } as Prisma.UserUpdateInput,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id.toString());

    // Set cookies
    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to dashboard
    return res.redirect(
      `${env.FRONTEND_URL}/dashboard?auth=linkedin&status=success`
    );
  } catch (error) {
    console.error("LinkedIn Auth Error:", error);
    return res.redirect(
      `${env.FRONTEND_URL}/login?error=Authentication failed&provider=linkedin`
    );
  }
};
