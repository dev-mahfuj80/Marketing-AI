import type { Request, Response } from "express";
import { LinkedInService } from "../services/linkedin.service.js";
import { env } from "../config/env.js";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

// Define interfaces for type safety without extending Express.Request
interface SessionData {
  linkedinState?: string;
  [key: string]: any;
}

interface UserData {
  id: string;
  [key: string]: any;
}

const prisma = new PrismaClient();


/**
 * LinkedIn controller for API interactions using client credentials directly
 */
export const linkedinController = {
  /**
   * Get LinkedIn authorization URL
   */
  getAuthUrl: async (req: Request, res: Response) => {
    try {
      // Generate a random state string
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Use type assertion for session property
      const sessionData = (req as any).session as SessionData | undefined;
      if (sessionData) {
        sessionData.linkedinState = state;
      }
      
      // Define the scopes we need
      // profile - Required to read basic profile info (name, photo) - this is the new replacement for r_liteprofile
      // email - Required to access email address
      // openid - Required for authentication
      // w_member_social - Required to post content (if we need this functionality)
      const scopes = ['profile', 'email', 'openid', 'w_member_social']; // Using all authorized permissions
      
      // We're including w_member_social since it's already authorized for the app
      // This will allow posting content to LinkedIn if needed 
      
      console.log('Requesting LinkedIn authorization with scopes:', scopes.join(' '));
      
      // Build the LinkedIn OAuth 2.0 authorization URL
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${
        new URLSearchParams({
          response_type: 'code',
          client_id: env.LINKEDIN_CLIENT_ID,
          redirect_uri: env.LINKEDIN_REDIRECT_URI,
          state,
          scope: scopes.join(' '),
        }).toString()
      }`;
      
      return res.status(200).json({
        authUrl,
        state
      });
    } catch (error) {
      console.error("Error generating LinkedIn auth URL:", error);
      return res.status(500).json({
        message: "Failed to generate LinkedIn auth URL",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  
  /**
   * Handle LinkedIn OAuth callback
   */
  handleCallback: async (req: Request, res: Response) => {
    try {
      console.log('LinkedIn OAuth callback received:', { 
        query: req.query,
        hasCode: !!req.query.code,
        hasError: !!req.query.error
      });
      
      // First, check for OAuth errors
      if (req.query.error) {
        console.error('LinkedIn OAuth error:', { 
          error: req.query.error,
          error_description: req.query.error_description 
        });
        
        return res.status(400).json({ 
          message: 'LinkedIn OAuth error',
          error: req.query.error,
          error_description: req.query.error_description
        });
      }
      
      const { code, state } = req.query;
      // Use type assertion for user property
      const userId = (req as any).user?.id;
      
      // Use type assertion for session property
      const sessionData = (req as any).session as SessionData | undefined;
      const expectedState = sessionData?.linkedinState;
      
      if (state !== expectedState && expectedState) {
        console.warn('LinkedIn OAuth state mismatch:', { received: state, expected: expectedState });
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      if (!code) {
        console.error('Authorization code is missing in LinkedIn callback');
        return res.status(400).json({ message: "Authorization code is missing" });
      }
      
      const redirectUri = env.LINKEDIN_REDIRECT_URI;
      console.log('Using redirect URI:', redirectUri);
      
      // Exchange code for access token
      console.log('Exchanging authorization code for access token...');
      let access_token, refresh_token, expires_in;
      
      try {
        const tokenResponse = await axios.post(
          "https://www.linkedin.com/oauth/v2/accessToken",
          new URLSearchParams({
            grant_type: "authorization_code",
            code: code.toString(),
            redirect_uri: redirectUri,
            client_id: env.LINKEDIN_CLIENT_ID,
            client_secret: env.LINKEDIN_CLIENT_SECRET,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        
        console.log('Received token response:', {
          status: tokenResponse.status,
          hasAccessToken: !!tokenResponse.data?.access_token,
          expiresIn: tokenResponse.data?.expires_in
        });
        
        // Extract token data
        ({ access_token, refresh_token, expires_in } = tokenResponse.data);
      } catch (tokenError) {
        console.error('Error exchanging code for token:', tokenError);
        if (axios.isAxiosError(tokenError) && tokenError.response) {
          console.error('Token exchange error details:', {
            status: tokenError.response.status,
            data: tokenError.response.data
          });
        }
        
        return res.status(400).json({
          message: 'Failed to exchange code for access token',
          error: tokenError instanceof Error ? tokenError.message : 'Unknown token exchange error'
        });
      }
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      // Get LinkedIn profile info to confirm identity
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const linkedInId = profileResponse.data.id;
      // Store profile info for reference, but don't try to save fields that don't exist in the schema
      const profileName = `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`;
      
      // Store tokens in user record if authenticated
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            linkedInAccessToken: access_token,
            linkedInRefreshToken: refresh_token,
            linkedInExpiresAt: expiresAt,
            linkedInId
            // Note: linkedInName field doesn't exist in the User schema
          }
        });
      }
      
      // Clear state from session
      if (sessionData && sessionData.linkedinState) {
        delete sessionData.linkedinState;
      }
      
      // Redirect to frontend with success message
      return res.redirect(`${env.FRONTEND_URL}/dashboard?linkedin=success`);
    } catch (error) {
      console.error("Error handling LinkedIn callback:", error);
      return res.redirect(`${env.FRONTEND_URL}/dashboard?linkedin=error&message=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`);
    }
  },
  
  /**
   * Disconnect LinkedIn account
   */
  disconnect: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Clear LinkedIn credentials
      await prisma.user.update({
        where: { id: userId },
        data: {
          linkedInAccessToken: null,
          linkedInRefreshToken: null,
          linkedInExpiresAt: null,
          linkedInId: null
          // Remove fields that don't exist in schema
        }
      });
      
      return res.status(200).json({ message: "LinkedIn account disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error);
      return res.status(500).json({
        message: "Failed to disconnect LinkedIn account",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  /**
   * Get LinkedIn posts using client credentials
   * Updated to handle the case where LinkedIn doesn't allow client credentials flow
   */
  getPosts: async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.query;

      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
        return res
          .status(500)
          .json({ message: "LinkedIn credentials not configured" });
      }

      try {
        // Attempt to get posts, but handle the expected permission error gracefully
        const linkedinService = new LinkedInService();
        const posts = await linkedinService.getPosts(Number(limit));
        return res.status(200).json(posts);
      } catch (apiError: any) {
        // Check if this is the special "access_denied" permission issue
        if (apiError?.response?.data?.error === "access_denied" && 
            apiError?.response?.data?.error_description?.includes("not allowed to create application tokens")) {
          
          console.log("LinkedIn Client Credentials permission error detected");
          
          // Return a more helpful error message with explanation and sample data
          return res.status(200).json({
            message: "LinkedIn requires special permission for client credentials flow",
            permissionError: true,
            permissionNote: "Your LinkedIn app is not allowed to use client credentials flow. Contact LinkedIn Developer Support for permission.",
            workaround: "You can still use user authentication flow with redirect URI.",
            redirectUri: env.REDIRECT_URI || "http://localhost:5000/api/auth/callback",
            // Return empty data array instead of error
            data: [],
            // Sample data structure for UI testing
            sampleData: [
              {
                id: 'sample-1',
                content: 'This is a sample LinkedIn post. Your app needs special LinkedIn permission for client credentials flow.',
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: 0
              }
            ]
          });
        } else {
          // Other API error - forward it
          throw apiError;
        }
      }
    } catch (error) {
      console.error("Error fetching LinkedIn posts:", error);
      return res
        .status(500)
        .json({ 
          message: "Failed to fetch LinkedIn posts", 
          error: error instanceof Error ? error.message : "Unknown error"
        });
    }
  },

  /**
   * Publish a post to LinkedIn using client credentials
   */
  publishPost: async (req: Request, res: Response) => {
    try {
      const { content, imageUrl, link } = req.body;
      
      // We might receive message as 'content' from frontend
      const message = content || req.body.message;

      if (!message) {
        return res
          .status(400)
          .json({ message: "Message content is required" });
      }

      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
        return res
          .status(500)
          .json({ message: "LinkedIn credentials not configured" });
      }

      const linkedinService = new LinkedInService();
      const result = await linkedinService.publishPost(message, imageUrl, link);

      return res.status(200).json({
        message: "Post published successfully to LinkedIn",
        postId: result.id,
        permalink: result.permalink,
      });
    } catch (error) {
      console.error("Error publishing LinkedIn post:", error);
      return res
        .status(500)
        .json({ message: "Failed to publish LinkedIn post" });
    }
  },

  /**
   * Check LinkedIn connection status
   * Now handles the access token from environment variables
   */
  getConnectionStatus: async (req: Request, res: Response) => {
    try {
      console.log('Checking LinkedIn connection status');
      
      // First check if we have a user with valid LinkedIn token
      const userId = (req as any).user?.id;
      
      if (userId) {
        console.log('User is authenticated, checking for LinkedIn tokens in user record');
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              linkedInAccessToken: true,
              linkedInExpiresAt: true,
              linkedInId: true
            }
          });
          
          if (user?.linkedInAccessToken) {
            console.log('Found LinkedIn access token in user record');
            
            // Check if token is expired
            if (user.linkedInExpiresAt && user.linkedInExpiresAt > new Date()) {
              console.log('User LinkedIn token is valid and not expired');
              
              // Optionally validate the token against LinkedIn API
              try {
                const linkedinService = new LinkedInService();
                const isValid = await linkedinService.validateAccessToken(user.linkedInAccessToken);
                
                if (isValid) {
                  return res.status(200).json({
                    connected: true,
                    credentialsExist: true,
                    credentialsValid: true,
                    accessTokenAvailable: true,
                    userId: userId,
                    linkedInId: user.linkedInId,
                    message: 'User is connected to LinkedIn with a valid token',
                    lastSync: new Date().toISOString()
                  });
                }
              } catch (validationError) {
                console.warn('LinkedIn validation error for user token:', validationError);
                // Continue with the flow - we'll fall back to environment token
              }
            } else {
              console.log('User LinkedIn token is expired, will try to refresh or fall back to environment token');
              // The refresh will be attempted in the LinkedInService
            }
          }
        } catch (userError) {
          console.error('Error checking user LinkedIn credentials:', userError);
          // Continue with fallback options
        }
      }
      
      // Check if we have the direct access token in the environment variables
      if (env.LINKEDIN_ACCESS_TOKEN) {
        console.log('LinkedIn access token found in environment variables:', 
          env.LINKEDIN_ACCESS_TOKEN.substring(0, 10) + '...');
        
        try {
          // Create LinkedIn service instance
          const linkedinService = new LinkedInService();
          
          // Validate the token using our dedicated validation method
          console.log('Attempting to validate LinkedIn access token...');
          const isValid = await linkedinService.validateAccessToken(env.LINKEDIN_ACCESS_TOKEN);
          console.log('LinkedIn token validation result:', isValid);
          
          if (isValid) {
            return res.status(200).json({
              connected: true,
              credentialsExist: true,
              credentialsValid: true,
              accessTokenAvailable: true,
              message: 'LinkedIn access token is valid',
              lastSync: new Date().toISOString()
            });
          } else {
            return res.status(200).json({
              connected: false,
              credentialsExist: true,
              credentialsValid: false,
              accessTokenAvailable: true,
              message: 'LinkedIn access token exists but appears to be invalid',
              error: 'LinkedIn token validation failed - token may be expired or have insufficient permissions',
              lastSync: null
            });
          }
        } catch (apiError) {
          console.error('Error during LinkedIn token validation process:', apiError);
          
          return res.status(200).json({
            connected: false,
            credentialsExist: true,
            credentialsValid: false,
            accessTokenAvailable: true,
            message: 'LinkedIn access token exists but could not be validated',
            error: apiError instanceof Error ? apiError.message : 'LinkedIn API authentication error',
            lastSync: null
          });
        }
      }
      
      // If no access token is available, check for client credentials
      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
        console.log('LinkedIn credentials not configured');
        return res.status(200).json({
          connected: false,
          credentialsExist: false,
          message: "LinkedIn credentials not configured",
          lastSync: null
        });
      }
      
      // We now know we have credentials - CHECK: are we trying to use client credentials flow?
      // LinkedIn tends to work better with OAuth flow than with client credentials
      // Let's guide the user toward the OAuth flow directly
      console.log('Preparing LinkedIn authentication guidance');
      
      // Generate the auth URL to make it easy for users to connect
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const scopes = ['profile', 'email', 'openid', 'w_member_social']; // Using all authorized permissions
      
      // Build the LinkedIn OAuth 2.0 authorization URL
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${
        new URLSearchParams({
          response_type: 'code',
          client_id: env.LINKEDIN_CLIENT_ID,
          redirect_uri: env.LINKEDIN_REDIRECT_URI,
          state,
          scope: scopes.join(' '),
        }).toString()
      }`;
      
      return res.status(200).json({
        connected: false,
        credentialsExist: true,
        credentialsValid: false,
        message: "LinkedIn requires user authentication for posting content",
        permissionNote: "To post to LinkedIn, you need to connect your account using OAuth.",
        nextSteps: "Click 'Connect LinkedIn' to authorize your account and grant the necessary permissions",
        oauthUrl: authUrl,
        scopes: scopes.join(' '),
        state: state,
        lastSync: null
      });
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
      return res
        .status(500)
        .json({ 
          message: "Failed to check LinkedIn connection",
          error: error instanceof Error ? error.message : "Unknown error"
        });
    }
  },
};
