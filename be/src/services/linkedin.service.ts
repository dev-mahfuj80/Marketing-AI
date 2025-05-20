import axios from "axios";
import { env } from "../config/env.js";
import FormData from "form-data";
import fs from "fs";
import { PrismaClient, Platform, PostStatus, User } from "@prisma/client";

const prisma = new PrismaClient();
const DEBUG = true;
const debug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[LinkedIn Service] ${message}`, data || "");
  }
};

/**
 * LinkedIn API service with support for both admin OAuth tokens and client credentials
 */
export class LinkedInService {
  // LinkedIn API versions
  private authApiVersion = "v2"; // For auth endpoints
  private marketingApiVersion = "v2"; // Marketing API for posts

  /**
   * Find an admin user with valid LinkedIn token
   * @private
   */
  private async getAdminWithValidToken(): Promise<User | null> {
    try {
      // Find admin user with unexpired LinkedIn token
      const admin = await prisma.user.findFirst({
        where: {
          role: "ADMIN",
          linkedInAccessToken: { not: null },
          linkedInRefreshToken: { not: null },
          linkedInExpiresAt: { gt: new Date() }, // Token must not be expired
        },
      });

      if (admin) {
        debug("Found admin with valid LinkedIn token");
        return admin;
      }

      // If we found an admin with an expired token, try to refresh it
      const adminWithExpiredToken = await prisma.user.findFirst({
        where: {
          role: "ADMIN",
          linkedInAccessToken: { not: null },
          linkedInRefreshToken: { not: null },
          // Token is expired
          linkedInExpiresAt: { lte: new Date() },
        },
      });

      if (adminWithExpiredToken && adminWithExpiredToken.linkedInRefreshToken) {
        debug("Found admin with expired LinkedIn token, attempting refresh");
        // Try to refresh the token
        return await this.refreshAdminToken(adminWithExpiredToken);
      }

      debug("No admin with LinkedIn token found");
      return null;
    } catch (error) {
      console.error("Error finding admin with valid LinkedIn token:", error);
      return null;
    }
  }

  /**
   * Refresh an expired LinkedIn token
   * @private
   */
  private async refreshAdminToken(admin: User): Promise<User | null> {
    try {
      debug("Refreshing LinkedIn admin token");

      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: admin.linkedInRefreshToken!,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate new expiry date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Update admin record with new tokens
      const updatedAdmin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          linkedInAccessToken: access_token,
          linkedInRefreshToken: refresh_token,
          linkedInExpiresAt: expiresAt,
        },
      });

      debug("Successfully refreshed LinkedIn token");
      return updatedAdmin;
    } catch (error) {
      console.error("Error refreshing LinkedIn token:", error);

      // If refresh fails, clear the token so we don't keep trying to use it
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          linkedInAccessToken: null,
          linkedInRefreshToken: null,
          linkedInExpiresAt: null,
        },
      });

      return null;
    }
  }

  /**
   * Get access token - tries admin OAuth token first, falls back to client credentials
   * @private
   */
  /**
   * Test if the LinkedIn credentials are valid by attempting to get an access token
   * This is a public method used to check credential validity
   */
  async testCredentials(): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    try {
      debug("Testing LinkedIn credentials");

      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
        throw new Error("LinkedIn client ID or client secret not configured");
      }

      // Attempt to get a client credentials token directly
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
          scope:
            "r_organization_social w_organization_social w_member_social r_liteprofile",
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      debug("LinkedIn credentials test successful", {
        expires_in: response.data.expires_in,
        has_token: !!response.data.access_token,
      });

      if (!response.data.access_token) {
        throw new Error("LinkedIn API returned success but no access token");
      }

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in || 3600, // Default 1 hour if no expiry
      };
    } catch (error) {
      debug("LinkedIn credentials test failed");

      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn API error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `LinkedIn credentials validation failed: ${errorMessage}`
      );
    }
  }

  /**
   * Get access token - tries admin OAuth token first, falls back to client credentials
   * @private
   */
  private async getAccessToken(): Promise<{
    access_token: string;
    expires_in?: number;
  }> {
    try {
      debug("Getting LinkedIn access token");

      // First try to get stored admin OAuth token if available
      const adminUser = await this.getAdminWithValidToken();

      if (adminUser && adminUser.linkedInAccessToken) {
        debug("Using admin OAuth token for LinkedIn API");
        return {
          access_token: adminUser.linkedInAccessToken,
          expires_in: adminUser.linkedInExpiresAt
            ? Math.floor(
                (adminUser.linkedInExpiresAt.getTime() - new Date().getTime()) /
                  1000
              )
            : 3600, // Default 1 hour if no expiry date
        };
      }

      // If no admin token is available, fallback to client credentials flow
      debug("No admin token available, using client credentials flow");
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
          scope:
            "r_organization_social w_organization_social w_member_social r_liteprofile",
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      debug("LinkedIn token response", {
        expires_in: response.data.expires_in,
        has_token: !!response.data.access_token,
      });

      return response.data;
    } catch (error) {
      console.error("Error getting LinkedIn access token:", error);

      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn token error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get LinkedIn access token: ${errorMessage}`);
    }
  }

  /**
   * Get posts from LinkedIn using client credentials or admin token
   * @param limit Number of posts to retrieve
   */
  async getPosts(limit = 10) {
    try {
      debug("Getting LinkedIn posts, limit:", limit);
      // Get access token (either from admin or client credentials)
      const tokenResponse = await this.getAccessToken();
      const accessToken = tokenResponse.access_token;
      debug("Received access token", {
        token_prefix: accessToken.substring(0, 10) + "...",
      });

      // Get organization info - with client credentials we need to use organization APIs
      // First, get the organization ID associated with the current credentials
      const orgResponse = await this.getOrganizationInfo(accessToken);

      if (!orgResponse || !orgResponse.organization) {
        throw new Error(
          "Could not retrieve organization information for LinkedIn account"
        );
      }

      const orgId = orgResponse.organization;
      debug("Using organization", { orgId });

      // Get posts using LinkedIn Marketing API - for organizations we use ugcPosts
      const response = await axios.get(
        `https://api.linkedin.com/rest/posts?q=author&author=${encodeURIComponent(
          orgId
        )}&count=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": this.marketingApiVersion,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      debug("LinkedIn posts response", { status: response.status });

      // If no actual posts data, return a default structure
      if (!response.data || !response.data.elements) {
        return {
          data: { elements: [] },
          paging: { count: 0, start: 0, total: 0 },
          elements: [],
        };
      }

      return {
        data: response.data,
        paging: response.data.paging || { count: 0, start: 0, total: 0 },
        elements: response.data.elements || [],
      };
    } catch (error) {
      console.error("Error fetching LinkedIn posts:", error);
      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn API error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to fetch LinkedIn posts: ${errorMessage}`);
    }
  }

  /**
   * Get organization information for the authenticated account
   * @param accessToken LinkedIn access token
   */
  private async getOrganizationInfo(accessToken: string) {
    try {
      debug("Getting organization info");

      // First try to get the organization using the /organizationalEntityAcls endpoint
      const aclResponse = await axios.get(
        "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      // Extract the organization URN from the response
      if (
        aclResponse.data &&
        aclResponse.data.elements &&
        aclResponse.data.elements.length > 0 &&
        aclResponse.data.elements[0].organizationalTarget
      ) {
        const orgUrn = aclResponse.data.elements[0].organizationalTarget;
        debug("Found organization from ACLs", { orgUrn });
        return { organization: orgUrn };
      }

      // Fallback to getting the person profile and finding their organizations
      const meResponse = await axios.get(`https://api.linkedin.com/v2/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const personId = meResponse.data.id;
      debug("Found person ID", { personId });

      // Use the person ID to create a default organization URN
      return { organization: `urn:li:person:${personId}` };
    } catch (error) {
      console.error("Error getting LinkedIn organization info:", error);
      // Provide a fallback method - use the client ID as a basis for a URN
      const fallbackUrn = `urn:li:organization:${env.LINKEDIN_CLIENT_ID.substring(
        0,
        8
      )}`;
      debug("Using fallback organization URN", { fallbackUrn });

      return { organization: fallbackUrn };
    }
  }

  /**
   * Publish a post to LinkedIn
   * @param message Message content for the post
   * @param imageUrl Optional image URL to include in the post
   * @param link Optional link to include in the post
   */
  async publishPost(message: string, imageUrl?: string, link?: string) {
    try {
      debug("Publishing LinkedIn post", {
        hasImage: !!imageUrl,
        hasLink: !!link,
      });

      // Get access token first
      const tokenResponse = await this.getAccessToken();
      const accessToken = tokenResponse.access_token;
      debug("Received access token", {
        token_prefix: accessToken.substring(0, 10) + "...",
      });

      // Get organization info
      const orgResponse = await this.getOrganizationInfo(accessToken);
      const authorUrn = orgResponse.organization;
      debug("Using author", { authorUrn });

      // Prepare post content using UGC Post API
      // LinkedIn's newer API uses a different format than the old /shares endpoint
      let postData: any = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: message,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      // Add link if provided
      if (link) {
        postData.specificContent[
          "com.linkedin.ugc.ShareContent"
        ].shareMediaCategory = "ARTICLE";
        postData.specificContent["com.linkedin.ugc.ShareContent"].media = [
          {
            status: "READY",
            description: {
              text: "Article description",
            },
            originalUrl: link,
            title: {
              text: "Shared Link",
            },
          },
        ];
      }
      // Add image if provided and no link (can't have both in one post)
      else if (imageUrl) {
        // For images, we need to register the image first, then create the post
        // This is a complex process and would require multiple API calls
        // For simplicity, we'll just include the image URL as a link for now
        postData.specificContent[
          "com.linkedin.ugc.ShareContent"
        ].shareMediaCategory = "ARTICLE";
        postData.specificContent["com.linkedin.ugc.ShareContent"].media = [
          {
            status: "READY",
            description: {
              text: "Image",
            },
            originalUrl: imageUrl,
            title: {
              text: "Image Post",
            },
          },
        ];
      }

      debug("LinkedIn post data", postData);

      // Publish post to LinkedIn using the UGC Post API
      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      debug("LinkedIn post created", { postId: response.data.id });

      return {
        id: response.data.id,
        permalink: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      console.error("Error publishing LinkedIn post:", error);

      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn API error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to publish LinkedIn post: ${errorMessage}`);
    }
  }

  /**
   * Validate LinkedIn access token by making requests to LinkedIn's API
   * @param accessToken The access token to validate
   * @returns Promise<boolean> True if the token is valid
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    // Try multiple different endpoints to validate the token
    // This helps when the token may have limited permissions
    const endpointsToTry = [
      // Try posts endpoint first - works with w_member_social permission
      { url: "https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aorganization%3A123)&count=1", description: "ugcPosts endpoint" },
      // Try organization API - works with organization permissions
      { url: "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee", description: "organization acls endpoint" },
      // Try profile endpoint - requires r_liteprofile or profile permission
      { url: "https://api.linkedin.com/v2/me", description: "profile endpoint" },
      // Try email endpoint - requires r_emailaddress or email permission
      { url: "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", description: "email endpoint" }
    ];
    
    try {
      debug("Validating LinkedIn access token using multiple endpoints");
      
      // Try each endpoint until one succeeds
      for (const endpoint of endpointsToTry) {
        try {
          debug(`Trying to validate token with ${endpoint.description}`);
          
          const response = await axios.get(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0', // Add protocol version for LinkedIn API
              'LinkedIn-Version': 'v2' // Add API version
            }
          });
          
          // If we get a 200 response, the token is valid
          if (response.status === 200) {
            debug(`LinkedIn token is valid - ${endpoint.description} returned 200`);
            return true;
          }
        } catch (endpointError) {
          if (axios.isAxiosError(endpointError)) {
            // If it's a permissions error (403), continue trying other endpoints
            if (endpointError.response?.status === 403) {
              debug(`Permission error for ${endpoint.description}:`, {
                status: endpointError.response?.status,
                message: endpointError.response?.data?.message || 'Permission denied'
              });
              // Continue to the next endpoint
              continue;
            }
            
            // If it's a 401 or other auth error, the token itself is invalid
            if (endpointError.response?.status === 401) {
              debug(`Authentication failed for ${endpoint.description} - Token is invalid`);
              return false;
            }
            
            debug(`Error calling ${endpoint.description}:`, {
              status: endpointError.response?.status,
              data: endpointError.response?.data
            });
          } else {
            debug(`Non-Axios error with ${endpoint.description}:`, endpointError);
          }
          // Continue to the next endpoint
        }
      }
      
      // If we tried all endpoints and none worked, try a simpler test:
      // Just check if we can make any call to the LinkedIn API
      try {
        debug("Trying API version endpoint as final validation");
        const versionResponse = await axios.get("https://api.linkedin.com/v2/apiConfig", {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });
        
        if (versionResponse.status === 200) {
          debug("LinkedIn token is valid - API version endpoint returned 200");
          return true;
        }
      } catch (versionError) {
        debug("API version endpoint failed, token appears invalid");
        // Final attempt failed
      }
      
      // If we get here, we've tried all endpoints and none worked
      debug("LinkedIn token validation failed - all endpoints returned errors");
      return false;
    } catch (error) {
      debug("LinkedIn token validation failed with unexpected error");
      if (axios.isAxiosError(error)) {
        debug("Axios error details:", { 
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        debug("Non-Axios error:", error);
      }
      
      // Token is invalid if we get here
      return false;
    }
  }
}
