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
  // Set content type header right at the beginning to ensure JSON response
  res.setHeader('Content-Type', 'application/json');
  try {
    console.log('=== LinkedIn Callback ===');
    console.log('Request query:', req.query);
  
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
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // IMPORTANT: This must EXACTLY match what's registered in the LinkedIn Developer Portal
    // Hardcode this to ensure consistency with what's registered in LinkedIn
    const redirectUri = 'http://localhost:3000/api/auth/callback';
    console.log('Using redirect URI for token exchange:', redirectUri);
    
    try {
      // Exchange authorization code for access token
      console.log('Exchanging authorization code for access token...');
      
      // Log the full authorization code for debugging
      console.log('Authorization code:', typeof code === 'string' ? code.substring(0, 15) + '...' : 'not a string');
      
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
        client_id: env.LINKEDIN_CLIENT_ID!,
        client_secret: env.LINKEDIN_CLIENT_SECRET!,
      });

      console.log('Token exchange request params:', {
        grant_type: 'authorization_code',
        code: code ? 'present' : 'missing',
        redirect_uri: redirectUri,
        client_id: env.LINKEDIN_CLIENT_ID ? 'present' : 'missing',
        client_secret: env.LINKEDIN_CLIENT_SECRET ? 'present' : 'missing',
      });
      
      // Log the URL we're sending the request to
      console.log('Sending token request to: https://www.linkedin.com/oauth/v2/accessToken');

      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        tokenParams.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );
      
      console.log('Token exchange response status:', tokenResponse.status);
      console.log('Token exchange response data:', JSON.stringify(tokenResponse.data, null, 2));

      if (!tokenResponse.data.access_token) {
        throw new Error('No access token received from LinkedIn');
      }

      const { access_token, expires_in, refresh_token, scope } = tokenResponse.data;
      
      console.log('Token exchange successful');
      console.log('Access token received, expires in:', expires_in, 'seconds');
      console.log('Scopes granted:', scope);

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
        // Update user record
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            linkedinConnected: true,
            linkedinAccessToken: access_token,
            linkedinProfileData: JSON.stringify(profileData),
            linkedinUserId: profileData.id,
          } as Prisma.UserUpdateInput,
        });
        
        console.log('LinkedIn connection successful! User ID:', req.user.id);
        
        const responseData = {
          success: true,
          message: 'LinkedIn authentication successful',
          user: {
            id: req.user.id,
            email: req.user.email
          },
          redirectTo: state || '/dashboard'
        };
        
        return res.status(200).json(responseData);
      } catch (dbError) {
        console.error('Error updating user with LinkedIn data:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Error saving LinkedIn credentials',
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }
    } catch (tokenExchangeError) {
      console.error('LinkedIn token exchange error:', tokenExchangeError);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong with LinkedIn authentication. Please try again later.',
        error: tokenExchangeError instanceof Error ? tokenExchangeError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong with LinkedIn authentication. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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
        linkedinConnected: false,
        linkedinAccessToken: null,
        linkedinRefreshToken: null,
        linkedinId: null,
        linkedinExpiresAt: null,
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
