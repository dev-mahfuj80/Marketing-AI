import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { env } from "../config/env.js";
import multer from "multer";
import util from "util";
import { FacebookService } from "../services/facebook.service.js";
import { LinkedInService } from "../services/linkedin.service.js";

// Prisma client
const prisma = new PrismaClient();

// Extend Request type to include file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
const uploadMiddleware = upload.single("image");
const uploadAsync = util.promisify(uploadMiddleware);

/**
 * Social Media Controller - handles all social media platform interactions
 */
export class SocialMediaController {

  // ===================================================================== FACEBOOK =====================================================================
  // Check Facebook status
  async checkFacebookStatus(req: Request, res: Response) {
    try {
      // First check if Facebook credentials are configured
      if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          message: "Facebook API credentials are not configured",
          lastChecked: new Date().toISOString(),
          permissionNote:
            "Please add Facebook app ID and page access token to your environment variables",
          nextSteps:
            "Contact your administrator to set up Facebook API credentials",
        });
      }

      // Test if the page access token is valid
      let tokenValid = false;
      let pageInfo = null;
      const requiredPermissions = [
        {
          name: "pages_read_engagement",
          description: "Access posts and metrics for Pages you manage",
          status: "unknown" as "granted" | "missing" | "unknown",
        },
        {
          name: "pages_manage_posts",
          description: "Create and manage posts for Pages you manage",
          status: "unknown" as "granted" | "missing" | "unknown",
        },
        {
          name: "pages_show_list",
          description: "Access the list of Pages you manage",
          status: "unknown" as "granted" | "missing" | "unknown",
        },
      ];

      try {
        // First, check if the token is valid by making a request to the FB Graph API
        const pageResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${env.FACEBOOK_PAGE_ID}`,
          {
            params: {
              access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
              fields: "id,name,category,picture,access_token,fan_count",
            },
          }
        );

        if (pageResponse.data && pageResponse.data.id) {
          tokenValid = true;
          pageInfo = {
            pageId: pageResponse.data.id,
            name: pageResponse.data.name,
            category: pageResponse.data.category,
            picture: pageResponse.data.picture?.data?.url || null,
            fanCount: pageResponse.data.fan_count || 0,
          };

          // Now check which permissions we have by trying to get posts
          try {
            const postsResponse = await axios.get(
              `https://graph.facebook.com/v18.0/${env.FACEBOOK_PAGE_ID}/posts`,
              {
                params: {
                  access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
                  limit: 1,
                },
              }
            );

            if (postsResponse.data && postsResponse.data.data) {
              // We have pages_read_engagement permission
              requiredPermissions[0].status = "granted";
            }
          } catch (postsError) {
            // If we get a permission error (code 10), mark as missing
            if (
              axios.isAxiosError(postsError) &&
              postsError.response?.data?.error?.code === 10
            ) {
              requiredPermissions[0].status = "missing";
            }
          }

          // Check publishing permissions by testing publish_status endpoint
          try {
            const publishPermissionResponse = await axios.get(
              `https://graph.facebook.com/v18.0/${env.FACEBOOK_PAGE_ID}/feed`,
              {
                params: {
                  access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
                  limit: 1,
                },
              }
            );

            if (publishPermissionResponse.status === 200) {
              // We have pages_manage_posts permission
              requiredPermissions[1].status = "granted";
            }
          } catch (publishError) {
            // If we get a permission error (code 10), mark as missing
            if (
              axios.isAxiosError(publishError) &&
              publishError.response?.data?.error?.code === 10
            ) {
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
        permissionNote:
          tokenValid && requiredPermissions.some((p) => p.status === "missing")
            ? "Your Facebook access token is missing some required permissions"
            : "Facebook integration requires a page access token with proper permissions",
        nextSteps: "Ensure your page access token has all required permissions",
        authUrl: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${
          env.FACEBOOK_APP_ID
        }&redirect_uri=${encodeURIComponent(
          env.REDIRECT_URI
        )}&state=facebook&scope=public_profile,pages_show_list,pages_read_engagement,pages_manage_posts`,
        pageInfo: pageInfo,
        permissions: requiredPermissions,
      });
    } catch (error) {
      console.error("Error checking Facebook status:", error);
      return res.status(500).json({
        connected: false,
        credentialsValid: false,
        message: "Error checking Facebook status",
        lastChecked: new Date().toISOString(),
        error: (error as Error).message,
      });
    }
  }

  // Get Facebook page posts
  async getFacebookPosts(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;

      // Use the page ID from parameters, or fall back to the one in environment variables
      const pageId = req.params.pageId || env.FACEBOOK_PAGE_ID || "me";

      if (!env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res
          .status(500)
          .json({ message: "Facebook page access token not configured" });
      }

      const facebookService = new FacebookService();
      const result = await facebookService.getPagePosts(
        pageId,
        env.FACEBOOK_PAGE_ACCESS_TOKEN,
        Number(limit)
      );

      const posts = result.data || [];

      // Transform posts to our format
      const formattedPosts = posts.map((post: any) => {
        const engagement = {
          impressions: post.insights?.data?.[0]?.values?.[0]?.value || 0,
          reactions: 0,
        };

        if (post.insights?.data?.[1]?.values?.[0]?.value) {
          const reactions = post.insights.data[1].values[0].value;
          // Type assertion to fix the reduce function
          engagement.reactions = Object.values(
            reactions as Record<string, number>
          ).reduce((a: number, b: number) => a + b, 0);
        }

        return {
          id: post.id,
          platformId: post.id,
          platform: "FACEBOOK",
          content: post.message || "",
          mediaUrl: post.attachments?.data?.[0]?.url || null,
          full_picture: post.full_picture || null,
          picture: post.picture || null,
          publishedAt: new Date(post.created_time),
          url: post.permalink_url,
          engagement,
        };
      });

      return res.status(200).json({ posts: formattedPosts });
    } catch (error) {
      console.error("Error fetching Facebook page posts:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch Facebook page posts" });
    }
  }

  // Publish Facebook page post
  async publishPagePost(req: MulterRequest, res: Response) {
    try {
      // Default to the page ID in the environment or use the one from the request
      const pageId = req.params.pageId || env.FACEBOOK_PAGE_ID;

      // Process file upload if present - do this BEFORE we try to access body
      try {
        await uploadAsync(req, res);
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return res.status(400).json({ message: "File upload failed" });
      }

      // Now we can safely access the body
      // Initialize message and link in case req.body is undefined
      let message = "";
      let link = undefined;

      // Safely access req.body properties
      if (req.body) {
        message = req.body.message || "";
        link = req.body.link;
      }

      if (!pageId || !message) {
        return res
          .status(400)
          .json({ message: "Page ID and message are required" });
      }

      if (!env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res
          .status(500)
          .json({ message: "Facebook page access token not configured" });
      }

      const facebookService = new FacebookService();
      let result;

      // Check if we have an image file
      if (req.file) {
        console.log("Image file detected, uploading to Facebook");
        result = await facebookService.publishPagePost(
          pageId,
          env.FACEBOOK_PAGE_ACCESS_TOKEN,
          message,
          link,
          req.file.buffer
        );
      } else {
        // No image, just publish the text post
        result = await facebookService.publishPagePost(
          pageId,
          env.FACEBOOK_PAGE_ACCESS_TOKEN,
          message,
          link
        );
      }

      // Save the post to our database
      if (result && result.id) {
        await prisma.post.create({
          data: {
            content: message,
            mediaUrl: link || (req.file ? "uploaded-image" : null),
            status: "PUBLISHED",
            platform: "FACEBOOK",
            platformId: result.id,
            publishedAt: new Date(),
            userId: req.user?.id || 1, // Default to user ID 1 if not authenticated
          },
        });
      }

      return res.status(200).json({
        message: "Post published successfully",
        postId: result.id,
      });
    } catch (error) {
      console.error("Error publishing Facebook post:", error);
      return res
        .status(500)
        .json({ message: "Failed to publish Facebook post" });
    }
  }

 // ===================================================================== LINKEDIN =====================================================================

  // Get LinkedIn profile 
  async getLinkedInProfile(req: Request, res: Response) {
    try {
      const linkedInService = new LinkedInService();
      const profileInfo = await linkedInService.getProfileInfo(env.LINKEDIN_ACCESS_TOKEN);
      return res.status(200).json({ profileInfo });
    } catch (error) {
      console.error("Error fetching LinkedIn profile:", error);
      return res.status(500).json({ message: "Failed to fetch LinkedIn profile" });
    }
  }
 
  // Check LinkedIn status
  async checkLinkedInStatus(req: Request, res: Response) {
    try {
      // First check if LinkedIn credentials are configured
      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_ACCESS_TOKEN) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          message: "LinkedIn API credentials are not configured",
          lastChecked: new Date().toISOString(),
          permissionNote:
            "Please add LinkedIn client ID and access token to your environment variables",
          nextSteps:
            "Contact your administrator to set up LinkedIn API credentials",
        });
      }

      // Test if the access token is valid
      let tokenValid = false;
      let profileInfo = null;
      
      try {
        // Check if the token is valid by making a request to the LinkedIn API
        const linkedInService = new LinkedInService();
        const profileResponse = await linkedInService.getProfileInfo(env.LINKEDIN_ACCESS_TOKEN);
        
        if (profileResponse && profileResponse.id) {
          tokenValid = true;
          profileInfo = profileResponse;
        }
      } catch (error) {
        console.error("LinkedIn token validation failed:", error);
        tokenValid = false;
      }

      // Response with status information
      return res.status(200).json({
        connected: tokenValid,
        credentialsValid: true, // If we have credentials set, consider them valid
        lastChecked: new Date().toISOString(),
        message: tokenValid
          ? "LinkedIn connection active"
          : "LinkedIn connection inactive or invalid token",
        permissionNote: tokenValid 
          ? "LinkedIn access token is valid"
          : "LinkedIn integration requires a valid access token",
        nextSteps: "Ensure your LinkedIn access token has not expired",
        profileInfo: profileInfo,
      });
    } catch (error) {
      console.error("Error checking LinkedIn status:", error);
      return res.status(500).json({
        connected: false,
        credentialsValid: false,
        message: "Error checking LinkedIn status",
        lastChecked: new Date().toISOString(),
        error: (error as Error).message,
      });
    }
  }

  // Get LinkedIn page posts
  async getLinkedInPagePosts(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;

      if (!env.LINKEDIN_ACCESS_TOKEN) {
        return res
          .status(500)
          .json({ message: "LinkedIn access token not configured" });
      }
      
      // Instantiate the LinkedIn service
      const linkedInService = new LinkedInService();
      
      // Get posts directly using the service
      // The service now has improved error handling and will return empty results instead of throwing
      const result = await linkedInService.getPosts(
        env.LINKEDIN_ACCESS_TOKEN,
        Number(limit)
      );
      
      // Normalize posts array
      const posts = result.elements || (Array.isArray(result) ? result : []);

      // Transform posts to our format
      const formattedPosts = posts.map((post: any) => {
        let content = "";
        let mediaUrl = null;

        // Handle share-specific content
        if (post.text) {
          // For /shares endpoint response
          content = post.text.text || "";
        } else if (
          post.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary
            ?.text
        ) {
          // For /ugcPosts endpoint response
          content =
            post.specificContent["com.linkedin.ugc.ShareContent"].shareCommentary
              .text;
        }

        // Handle media URL
        if (post.content?.contentEntities?.[0]?.entityLocation) {
          // For /shares endpoint response
          mediaUrl = post.content.contentEntities[0].entityLocation;
        } else if (
          post.specificContent?.["com.linkedin.ugc.ShareContent"]?.media?.[0]
            ?.originalUrl
        ) {
          // For /ugcPosts endpoint response
          mediaUrl =
            post.specificContent["com.linkedin.ugc.ShareContent"].media[0]
              .originalUrl;
        }

        return {
          id: post.id || post.activity || `linkedin-${Date.now()}`,
          platformId: post.id || post.activity,
          platform: "LINKEDIN",
          content,
          mediaUrl,
          publishedAt:
            post.created?.time ||
            post.createdTime ||
            post.lastModified?.time ||
            post.lastModifiedTime ||
            new Date(),
          url: null, // LinkedIn API doesn't easily provide permalinks
          engagement: {
            impressions: 0, 
            reactions: 0,
          },
        };
      });

      return res.status(200).json({ posts: formattedPosts });
    } catch (error) {
      console.error("Error fetching LinkedIn page posts:", error);
      // Always return a 200 response with empty posts array to avoid frontend errors
      return res.status(200).json({ 
        posts: [], 
        error: "Failed to fetch LinkedIn posts. Please check server logs for details."
      });
    }
  }
// Publish LinkedIn post
  async publishLinkedInPost(req: MulterRequest, res: Response) {
    try {
      // Process file upload if present - do this BEFORE we try to access body
      try {
        await uploadAsync(req, res);
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return res.status(400).json({ message: "File upload failed" });
      }

      // Now we can safely access the body
      // Initialize message and link in case req.body is undefined
      let message = "";
      let link = undefined;

      // Safely access req.body properties
      if (req.body) {
        message = req.body.message || "";
        link = req.body.link;
      }

      if (!message) {
        return res
          .status(400)
          .json({ message: "Message is required" });
      }

      if (!env.LINKEDIN_ACCESS_TOKEN) {
        return res
          .status(500)
          .json({ message: "LinkedIn access token not configured" });
      }

      const linkedInService = new LinkedInService();
      let result;

      // Check if we have an image file or link
      if (req.file) {
        // This would require uploading to a publicly accessible URL first
        // For simplicity, we'll just note that this functionality would need additional implementation
        return res.status(400).json({ 
          message: "Direct image uploads for LinkedIn not supported. Please provide a public image URL instead." 
        });
      } else if (link) {
        // If we have a link, use it as the article URL
        result = await linkedInService.publishPost(
          env.LINKEDIN_ACCESS_TOKEN,
          message,
          undefined,
          link
        );
      } else {
        // No image or link, just publish the text post
        result = await linkedInService.publishPost(
          env.LINKEDIN_ACCESS_TOKEN,
          message
        );
      }

      // Save the post to our database
      if (result && result.id) {
        await prisma.post.create({
          data: {
            content: message,
            mediaUrl: link || null,
            status: "PUBLISHED",
            platform: "LINKEDIN",
            platformId: result.id,
            publishedAt: new Date(),
            userId: req.user?.id || 1, // Default to user ID 1 if not authenticated
          },
        });
      }

      return res.status(200).json({
        message: "Post published successfully to LinkedIn",
        postId: result.id,
      });
    } catch (error) {
      console.error("Error publishing LinkedIn post:", error);
      return res
        .status(500)
        .json({ message: "Failed to publish LinkedIn post" });
    }
  }

  // ===================================================================== CROSS-PLATFORM =====================================================================

  async createPost(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { content, platforms, mediaUrl, scheduledDate } = req.body;

      if (
        !content ||
        !platforms ||
        !Array.isArray(platforms) ||
        platforms.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Content and at least one platform are required" });
      }

      // Validate platforms
      const validPlatforms = ["FACEBOOK", "LINKEDIN"];
      const invalidPlatforms = platforms.filter(
        (platform: string) => !validPlatforms.includes(platform)
      );

      if (invalidPlatforms.length > 0) {
        return res
          .status(400)
          .json({ message: `Invalid platforms: ${invalidPlatforms.join(", ")}` });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const postResults: Array<{
        id: number;
        content: string;
        mediaUrl: string | null;
        status: string;
        platform: string;
        platformId: string | null;
        publishedAt: Date | null;
        userId: number;
      }> = [];
      const errors: { platform: string; message: string }[] = [];

      // Handle scheduled posts
      if (scheduledDate) {
        const scheduledTime = new Date(scheduledDate);

        if (isNaN(scheduledTime.getTime()) || scheduledTime <= new Date()) {
          return res
            .status(400)
            .json({ message: "Scheduled date must be in the future" });
        }

        // Create scheduled post in our database
        const scheduledPost = await prisma.post.create({
          data: {
            content,
            mediaUrl,
            status: "SCHEDULED",
            publishedAt: scheduledTime,
            platform: platforms[0], // Use first platform for now
            userId: req.user.id,
          },
        });

        return res.status(201).json({
          message: "Post scheduled successfully",
          post: scheduledPost,
        });
      }

      // Handle immediate posting to platforms
      for (const platform of platforms) {
        try {
          if (platform === "FACEBOOK" && user.facebookToken) {
            // Get Facebook Pages
            const pagesResponse = await axios.get(
              "https://graph.facebook.com/v18.0/me/accounts",
              {
                params: {
                  access_token: user.facebookToken,
                  fields: "id,name,access_token",
                },
              }
            );

            const pages = pagesResponse.data.data || [];

            if (pages.length === 0) {
              errors.push({ platform, message: "No Facebook pages found" });
              continue;
            }

            // Use the first page's access token
            const pageAccessToken = pages[0].access_token;
            const pageId = pages[0].id;

            // Create post payload
            const postData: Record<string, unknown> = { message: content };

            // Add media if provided
            if (mediaUrl) {
              if (mediaUrl.startsWith("http")) {
                postData.link = mediaUrl;
              } else {
                // For uploaded images, a different endpoint would be needed
                errors.push({
                  platform,
                  message: "Direct image upload not implemented yet",
                });
                continue;
              }
            }

            // Post to Facebook
            const response = await axios.post(
              `https://graph.facebook.com/v18.0/${pageId}/feed`,
              null,
              {
                params: {
                  ...postData,
                  access_token: pageAccessToken,
                },
              }
            );

            if (response.data?.id) {
              // Save post to database
              const savedPost = await prisma.post.create({
                data: {
                  content,
                  mediaUrl,
                  status: "PUBLISHED",
                  platform: "FACEBOOK",
                  platformId: response.data.id,
                  publishedAt: new Date(),
                  userId: req.user.id,
                },
              });

              postResults.push(savedPost);
            }
          } else if (platform === "LINKEDIN" && user.linkedInToken) {
            // Get user profile to get URN
            const profileResponse = await axios.get(
              "https://api.linkedin.com/v2/me",
              {
                headers: {
                  Authorization: `Bearer ${user.linkedInToken}`,
                },
              }
            );

            const personId = profileResponse.data.id;
            const personUrn = `urn:li:person:${personId}`;

            // Create post payload
            const postPayload: Record<string, unknown> = {
              author: personUrn,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  shareCommentary: {
                    text: content,
                  },
                  shareMediaCategory: "NONE",
                },
              },
              visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
              },
            };

            // Add media if provided
            if (mediaUrl && mediaUrl.startsWith("http")) {
              // Type assertion to safely access ShareContent
              (postPayload.specificContent as any)[
                "com.linkedin.ugc.ShareContent"
              ].shareMediaCategory = "ARTICLE";
              // Type assertion for ShareContent
              (postPayload.specificContent as any)[
                "com.linkedin.ugc.ShareContent"
              ].media = [
                {
                  status: "READY",
                  originalUrl: mediaUrl,
                },
              ];
            }

            // Post to LinkedIn
            const response = await axios.post(
              "https://api.linkedin.com/v2/ugcPosts",
              postPayload,
              {
                headers: {
                  Authorization: `Bearer ${user.linkedInToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.data?.id) {
              // Save post to database
              const savedPost = await prisma.post.create({
                data: {
                  content,
                  mediaUrl,
                  status: "PUBLISHED",
                  platform: "LINKEDIN",
                  platformId: response.data.id,
                  publishedAt: new Date(),
                  userId: req.user.id,
                },
              });

              postResults.push(savedPost);
            }
          } else {
            errors.push({ platform, message: "Platform not connected" });
          }
        } catch (error: any) {
          console.error(
            `Error posting to ${platform}:`,
            error.response?.data || error.message
          );
          errors.push({
            platform,
            message: error.response?.data?.error?.message || error.message,
          });
        }
      }

      if (postResults.length === 0 && errors.length > 0) {
        return res
          .status(400)
          .json({ message: "Failed to create posts", errors });
      }

      return res.status(201).json({
        message: "Posts created successfully",
        posts: postResults,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      console.error("Error creating post:", error.message);
      return res.status(500).json({ message: "Server error creating post" });
    }
  }
}

// Export controller instance
export const socialMediaController = new SocialMediaController();
