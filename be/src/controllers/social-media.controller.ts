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

// Social Media Controller
export class SocialMediaController {
  // ============================================ FACEBOOK ============================================
  // Check Facebook status
  async getFacebookProfileStatus(req: Request, res: Response) {
    try {
      if (!env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          message: "Facebook page access token not configured",
          lastChecked: new Date().toISOString(),
          permissionNote:
            "Please add Facebook page access token to your environment variables",
          nextSteps:
            "Contact your administrator to set up Facebook page access token",
        });
      }
      return res.status(200).json({
        message: "Facebook connection active",
      });
    } catch (error) {
      console.error("Error checking Facebook status:", error);
      return res.status(500).json({
        message: "Error checking Facebook status",
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

      return res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching Facebook page posts:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch Facebook page posts" });
    }
  }

  // ================================================ LINKEDIN =====================================================

  // Check LinkedIn status
  async getLinkedInProfileStatus(req: Request, res: Response) {
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
        const profileResponse = await linkedInService.getProfileInfo(
          env.LINKEDIN_ACCESS_TOKEN
        );

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
      const { start = 0, count = 10 } = req.query;

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
        Number(start),
        Number(count)
      );

      // Normalize posts array
      const posts = result.elements || (Array.isArray(result) ? result : []);
      console.log("posts", posts);
      // update posts array so that it can be useful in frontend and database

      return res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching LinkedIn page posts:", error);
      // Always return a 200 response with empty posts array to avoid frontend errors
      return res.status(200).json({
        posts: [],
        error:
          "Failed to fetch LinkedIn posts. Please check server logs for details.",
      });
    }
  }

  // ======================================= CROSS-PLATFORM ============================================

  // Create post
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
        return res.status(400).json({
          message: `Invalid platforms: ${invalidPlatforms.join(", ")}`,
        });
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
          } else if (platform === "LINKEDIN" && user.linkedInAccessToken) {
            // Get user profile to get URN
            const profileResponse = await axios.get(
              "https://api.linkedin.com/v2/me",
              {
                headers: {
                  Authorization: `Bearer ${user.linkedInAccessToken}`,
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
                  Authorization: `Bearer ${user.linkedInAccessToken}`,
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
