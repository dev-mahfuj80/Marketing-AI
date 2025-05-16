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

  // Use the frontend URL from environment variables
  const redirectUri = encodeURIComponent(`${env.FRONTEND_URL}/`);
  
  console.log('Using LinkedIn redirect URI:', `${env.FRONTEND_URL}/`);
  // Only include scopes that are approved in the LinkedIn Developer Portal
  // Note: r_liteprofile is deprecated, using 'profile' instead
  const scopes = ["profile", "w_member_social"];

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=linkedin`;

  return res.status(200).json({ authUrl });
};

/**
 * LinkedIn OAuth callback handler
 */
export const linkedInCallback = async (req: Request, res: Response) => {
  console.log('=== LinkedIn Callback ===');
  console.log('Request query:', req.query);
  
  try {
    const { code, state, error, error_description } = req.query;

    // Log all query parameters for debugging
    console.log('Callback parameters:', { code, state, error, error_description });

    if (!code) {
      console.error('Missing authorization code');
      return res.status(400).json({ 
        success: false,
        message: "Missing authorization code" 
      });
    }

    if (error) {
      console.error('OAuth error from LinkedIn:', { error, error_description });
      return res.status(400).json({
        success: false,
        message: `OAuth error: ${error_description || error}`
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Use the same redirect URI that was used in the initial OAuth request
    // This must match exactly what's registered in the LinkedIn Developer Portal
    const redirectUri = `${env.FRONTEND_URL}/api/auth/callback`;
    console.log('Using redirect URI for token exchange:', redirectUri);
    
    console.log('Using LinkedIn token exchange redirect URI:', `http://localhost:3000/`);

    // Exchange authorization code for access token
    console.log('Exchanging authorization code for access token...');
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
        client_id: env.LINKEDIN_CLIENT_ID!,
        client_secret: env.LINKEDIN_CLIENT_SECRET!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in, refresh_token, scope } = tokenResponse.data;
    
    console.log('Token exchange successful');
    console.log('Access token received, expires in:', expires_in, 'seconds');
    console.log('Scopes granted:', scope);
    
    if (!access_token) {
      console.error('No access token in response:', tokenResponse.data);
      throw new Error('No access token received from LinkedIn');
    }

    // Retrieve LinkedIn profile data
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const profileData = profileResponse.data;
    console.log('LinkedIn profile data:', JSON.stringify(profileData, null, 2));
    
    // Store LinkedIn access token in the database
    console.log('Storing LinkedIn access token in database...');
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          linkedInAccessToken: access_token,
          linkedInRefreshToken: refresh_token || null,
          linkedInId: profileData.id,
          linkedInExpiresAt: new Date(Date.now() + (expires_in * 1000)),
          updatedAt: new Date(),
        },
      });
      console.log('Successfully stored LinkedIn access token');
    } catch (dbError) {
      console.error('Error storing LinkedIn token in database:', dbError);
      throw new Error('Failed to store LinkedIn authentication data');
    }

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
        linkedInAccessToken: null,
        linkedInRefreshToken: null,
        linkedInId: null,
        linkedInExpiresAt: null,
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
