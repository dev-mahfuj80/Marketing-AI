import { Request, Response } from "express";
import axios from "axios";
import { env } from "../config/env.js";

/**
 * Controller for checking Facebook connection status and permissions
 */
export class FacebookStatusController {
  /**
   * Check Facebook connection status and available permissions
   */
  async checkStatus(req: Request, res: Response) {
    try {
      // First check if Facebook credentials are configured
      if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          message: "Facebook API credentials are not configured",
          lastChecked: new Date().toISOString(),
          permissionNote: "Please add Facebook app ID and page access token to your environment variables",
          nextSteps: "Contact your administrator to set up Facebook API credentials"
        });
      }

      // Test if the page access token is valid
      let tokenValid = false;
      let pageInfo = null;
      const requiredPermissions = [
        {
          name: "pages_read_engagement",
          description: "Access posts and metrics for Pages you manage",
          status: "unknown" as "granted" | "missing" | "unknown"
        },
        {
          name: "pages_manage_posts",
          description: "Create and manage posts for Pages you manage",
          status: "unknown" as "granted" | "missing" | "unknown"
        },
        {
          name: "pages_show_list",
          description: "Access the list of Pages you manage",
          status: "unknown" as "granted" | "missing" | "unknown"
        }
      ];

      try {
        // First, check if the token is valid by making a request to the FB Graph API
        const pageResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${env.FACEBOOK_PAGE_ID}`,
          {
            params: {
              access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
              fields: "id,name,category,picture,access_token,fan_count"
            }
          }
        );

        if (pageResponse.data && pageResponse.data.id) {
          tokenValid = true;
          pageInfo = {
            pageId: pageResponse.data.id,
            name: pageResponse.data.name,
            category: pageResponse.data.category,
            picture: pageResponse.data.picture?.data?.url || null,
            fanCount: pageResponse.data.fan_count || 0
          };

          // Now check which permissions we have by trying to get posts
          try {
            const postsResponse = await axios.get(
              `https://graph.facebook.com/v18.0/${env.FACEBOOK_PAGE_ID}/posts`,
              {
                params: {
                  access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
                  limit: 1
                }
              }
            );

            if (postsResponse.data && postsResponse.data.data) {
              // We have pages_read_engagement permission
              requiredPermissions[0].status = "granted";
            }
          } catch (postsError) {
            // If we get a permission error (code 10), mark as missing
            if (axios.isAxiosError(postsError) && 
                postsError.response?.data?.error?.code === 10) {
              requiredPermissions[0].status = "missing";
            }
          }

          // Check publishing permissions by testing publish_status endpoint
          // Note: This is just a permission check, it won't actually publish anything
          try {
            const publishPermissionResponse = await axios.get(
              `https://graph.facebook.com/v18.0/${env.FACEBOOK_PAGE_ID}/feed`,
              {
                params: {
                  access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
                  limit: 1
                }
              }
            );

            if (publishPermissionResponse.status === 200) {
              // We have pages_manage_posts permission
              requiredPermissions[1].status = "granted";
            }
          } catch (publishError) {
            // If we get a permission error (code 10), mark as missing
            if (axios.isAxiosError(publishError) && 
                publishError.response?.data?.error?.code === 10) {
              requiredPermissions[1].status = "missing";
            }
          }

          // If we made it this far and got page info, assume pages_show_list is granted
          requiredPermissions[2].status = "granted";
        }
      } catch (error) {
        console.error("Facebook token validation failed:", error);
        tokenValid = false;
      }

      // Response with detailed status information
      return res.status(200).json({
        connected: tokenValid,
        credentialsValid: true, // If we have credentials set, consider them valid
        lastChecked: new Date().toISOString(),
        message: tokenValid 
          ? "Facebook connection active" 
          : "Facebook connection inactive or invalid token",
        permissionNote: tokenValid && requiredPermissions.some(p => p.status === "missing")
          ? "Your Facebook access token is missing some required permissions"
          : "Facebook integration requires a page access token with proper permissions",
        nextSteps: "Ensure your page access token has all required permissions",
        authUrl: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(env.REDIRECT_URI)}&state=facebook&scope=public_profile,pages_show_list,pages_read_engagement,pages_manage_posts`,
        pageInfo: pageInfo,
        permissions: requiredPermissions
      });
    } catch (error) {
      console.error("Error checking Facebook status:", error);
      return res.status(500).json({
        connected: false,
        credentialsValid: false,
        message: "Error checking Facebook status",
        lastChecked: new Date().toISOString(),
        error: (error as Error).message
      });
    }
  }
}

// Export controller instance
export const facebookStatusController = new FacebookStatusController();
