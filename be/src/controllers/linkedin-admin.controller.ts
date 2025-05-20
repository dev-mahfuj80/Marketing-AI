import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { env } from "../config/env.js";

// Define AuthRequest type to match Express.Request with user property
type AuthRequest = Request & {
  user?: {
    id: number;
    email: string;
    role: string;
  };
};

const prisma = new PrismaClient();

// LinkedIn OAuth configuration
const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USER_INFO_URL = "https://api.linkedin.com/v2/me";

export class LinkedInAdminController {
  // Initiate LinkedIn OAuth flow
  initiateOAuth = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Generate a random state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store the state in the user's session or a database to verify later
      // For this implementation, we'll store it in the user record
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { 
          // Using resetPasswordToken field to temporarily store state
          // We'll clear this after the OAuth flow is complete
          resetPasswordToken: state 
        }
      });
      
      // Define the LinkedIn authorization URL
      const authUrl = new URL(LINKEDIN_AUTH_URL);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", env.LINKEDIN_CLIENT_ID);
      authUrl.searchParams.append("redirect_uri", `${env.FRONTEND_URL}/api/linkedin-admin/callback`);
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("scope", "r_organization_social w_member_social w_organization_social r_liteprofile");
      
      // Redirect user to LinkedIn authorization page
      res.json({ authUrl: authUrl.toString() });
    } catch (error) {
      console.error("Error initiating LinkedIn OAuth:", error);
      res.status(500).json({ message: "Error initiating LinkedIn OAuth flow" });
    }
  };

  // Handle OAuth callback from LinkedIn
  handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, error } = req.query;
      
      // Handle LinkedIn OAuth errors
      if (error) {
        console.error("LinkedIn OAuth error:", error);
        res.status(400).json({ 
          success: false, 
          message: "LinkedIn OAuth error", 
          error 
        });
        return;
      }
      
      if (!code || !state) {
        res.status(400).json({ 
          success: false, 
          message: "Missing code or state parameter" 
        });
        return;
      }
      
      // Find user with matching state (CSRF protection)
      const user = await prisma.user.findFirst({
        where: { resetPasswordToken: state as string }
      });
      
      if (!user) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid state parameter" 
        });
        return;
      }
      
      // Exchange code for access token
      const tokenResponse = await axios.post(
        LINKEDIN_TOKEN_URL,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: `${env.FRONTEND_URL}/api/linkedin-admin/callback`,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      
      const { 
        access_token, 
        refresh_token, 
        expires_in 
      } = tokenResponse.data;
      
      // Get user info from LinkedIn to verify the connection
      const userInfoResponse = await axios.get(LINKEDIN_USER_INFO_URL, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      const linkedInId = userInfoResponse.data.id;
      
      // Calculate token expiry date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      // Save tokens to user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedInAccessToken: access_token,
          linkedInRefreshToken: refresh_token,
          linkedInId: linkedInId,
          linkedInExpiresAt: expiresAt,
          // Clear the temporary state token
          resetPasswordToken: null
        }
      });
      
      // Return success
      res.json({
        success: true,
        message: "LinkedIn account connected successfully"
      });
    } catch (error) {
      console.error("Error handling LinkedIn OAuth callback:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error processing LinkedIn OAuth callback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  // Get LinkedIn connection status
  getLinkedInStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          linkedInId: true,
          linkedInExpiresAt: true
        }
      });
      
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      const isConnected = !!user.linkedInId;
      const isExpired = user.linkedInExpiresAt ? new Date() > user.linkedInExpiresAt : true;
      
      res.json({
        isConnected,
        isExpired,
        // Don't expose the actual token, just whether it exists and is valid
        needsReauth: isConnected && isExpired
      });
    } catch (error) {
      console.error("Error getting LinkedIn status:", error);
      res.status(500).json({ message: "Error checking LinkedIn connection status" });
    }
  };

  // Revoke LinkedIn access
  revokeAccess = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          linkedInAccessToken: null,
          linkedInRefreshToken: null,
          linkedInId: null,
          linkedInExpiresAt: null
        }
      });
      
      res.json({ message: "LinkedIn access revoked successfully" });
    } catch (error) {
      console.error("Error revoking LinkedIn access:", error);
      res.status(500).json({ message: "Error revoking LinkedIn connection" });
    }
  };
}
