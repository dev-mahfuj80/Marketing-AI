import type { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";
import { env } from "../config/env.js";

const prisma = new PrismaClient();

// Note: Facebook OAuth functionality has been removed since we're now using the page access token directly
// This file now only contains LinkedIn OAuth functionality

/**
 * Initiate LinkedIn OAuth flow
 */
export const initiateOAuthLinkedIn = async (req: Request, res: Response) => {
  if (!env.LINKEDIN_CLIENT_ID) {
    return res
      .status(500)
      .json({ message: "LinkedIn Client ID not configured" });
  }

  const redirectUri = `${env.REDIRECT_URI}/linkedin`;
  const scopes = ["r_liteprofile", "r_emailaddress", "w_member_social"];

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
    env.LINKEDIN_CLIENT_ID
  }&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=linkedin`;

  return res.status(200).json({ authUrl });
};

/**
 * LinkedIn OAuth callback handler
 */
export const linkedInCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== "linkedin") {
      return res.status(400).json({ message: "Invalid callback parameters" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
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

    const { access_token, expires_in } = tokenResponse.data;

    // Calculate token expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);

    // Store token in user record
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        // @ts-ignore - These fields exist in our schema but TypeScript doesn't recognize them
        linkedInToken: access_token,
        linkedInTokenExpiry: expiryDate,
      } as Prisma.UserUpdateInput,
    });

    // Redirect to frontend
    return res.redirect(
      `${env.FRONTEND_URL}/dashboard/settings?platform=linkedin&status=success`
    );
  } catch (error) {
    const err = error as Error & { response?: { data?: any; status?: number } };
    console.error("LinkedIn OAuth error:", err.response?.data || err.message);
    return res.redirect(
      `${
        env.FRONTEND_URL
      }/dashboard/settings?platform=linkedin&status=error&message=${encodeURIComponent(
        err.message || "An error occurred"
      )}`
    );
  }
};

/**
 * Disconnect LinkedIn account
 */
export const disconnectSocialAccount = async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (platform !== "linkedin") {
      return res
        .status(400)
        .json({ message: "Invalid platform - only LinkedIn is supported" });
    }

    // Update user record to remove LinkedIn token
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        // Use Prisma.UserUpdateInput type casting for custom fields
        linkedInToken: null,
        linkedInTokenExpiry: null,
      } as Prisma.UserUpdateInput,
    });

    return res.status(200).json({ message: `Disconnected from LinkedIn` });
  } catch (error) {
    const err = error as Error;
    console.error("Disconnect LinkedIn account error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error disconnecting account" });
  }
};
