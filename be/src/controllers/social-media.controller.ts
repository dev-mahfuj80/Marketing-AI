import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { FacebookService } from "../services/social-media.service.js";
import { LinkedInService } from "../services/social-media.service.js";

// Prisma client
const prisma = new PrismaClient();

// Extend Request type to include file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Multer configuration has been moved to the routes file

// Social Media Controller
export class SocialMediaController {
  // ============================================ FACEBOOK ============================================
  // Check Facebook status
  async getFacebookProfileStatus(req: Request, res: Response) {
    try {
      const { token } = req.query;
      const accessToken = (token as string) || env.FACEBOOK_PAGE_ACCESS_TOKEN;
      const pageId = env.FACEBOOK_PAGE_ID || "me";

      if (!accessToken) {
        return res.status(400).json({
          connected: false,
          message: "Facebook access token not provided",
          lastChecked: new Date().toISOString(),
        });
      }

      const facebookService = new FacebookService();
      const result = await facebookService.getFacebookProfileStatus(
        accessToken,
        pageId
      );

      return res.status(200).json({
        message: "Facebook connection info retrieved",
        connected: true,
        credentialsValid: true,
        lastChecked: new Date().toISOString(),
        pageInfo: result.pageInfo,
        tokenInfo: result.tokenInfo,
        accessiblePages: result.accessiblePages,
      });
    } catch (error) {
      console.error("Error checking Facebook status:", error);
      return res.status(200).json({
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

      return res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching Facebook page posts:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch Facebook page posts" });
    }
  }

  // ============================================ LINKEDIN =============================================

  // Check LinkedIn status
  async getLinkedInProfileStatus(req: Request, res: Response) {
    try {
      // Get token from query or environment variables
      const { token } = req.query;
      const linkedinAccessToken =
        (token as string) || env.LINKEDIN_ACCESS_TOKEN;

      if (!linkedinAccessToken) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          profileInfo: null,
          message: "LinkedIn access token not provided",
          lastChecked: new Date().toISOString(),
          error: "LinkedIn access token not provided",
        });
      }

      const linkedInService = new LinkedInService();
      const profileResponse = await linkedInService.getLinkedInProfileStatus(
        linkedinAccessToken
      );

      if (
        profileResponse &&
        profileResponse.profileInfo &&
        profileResponse.profileInfo.id
      ) {
        return res.status(200).json({
          connected: true,
          credentialsValid: true,
          lastChecked: new Date().toISOString(),
          profileInfo: profileResponse.profileInfo,
          tokenInfo: profileResponse.tokenInfo,
          accessibleOrganizations: profileResponse.accessibleOrganizations,
        });
      } else {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          profileInfo: null,
          tokenInfo: profileResponse?.tokenInfo || null,
          message: "Invalid LinkedIn profile response",
          lastChecked: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("LinkedIn token validation failed:", error);
      return res.status(200).json({
        connected: false,
        credentialsValid: false,
        profileInfo: null,
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
      console.log("Received post data:", req.body);

      if (!req.body) {
        return res.status(400).json({ message: "No post data provided" });
      }

      // Get the file from the request if it was uploaded
      const file = (req as any).file;
      const { content, publishToFacebook, publishToLinkedin } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Post content is required" });
      }

      // Prepare the response data
      const responseData: any = {
        message: "Post created successfully",
        post: {
          content,
          publishToFacebook: publishToFacebook === "true",
          publishToLinkedin: publishToLinkedin === "true",
          hasImage: !!file,
          imageInfo: file
            ? {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
              }
            : null,
          publishedTo: {
            facebook: false,
            linkedin: false,
          },
          errors: {},
        },
      };

      // Process Facebook post if requested
      if (publishToFacebook === "true") {
        try {
          const facebookService = new FacebookService();
          const facebookResponse = await facebookService.createPost(
            env.FACEBOOK_PAGE_ID || "me",
            env.FACEBOOK_PAGE_ACCESS_TOKEN || "",
            content,
            file?.buffer
          );
          console.log("Facebook post created:", facebookResponse);
          responseData.post.publishedTo.facebook = true;
          responseData.post.facebookResponse = facebookResponse;
        } catch (facebookError: any) {
          console.error("Error posting to Facebook:", facebookError);
          responseData.post.publishedTo.facebook = false;
          responseData.post.errors.facebook = facebookError.message;
        }
      }

      // Process LinkedIn post if requested
      if (publishToLinkedin === "true") {
        try {
          const linkedInService = new LinkedInService();
          const linkedInResponse = await linkedInService.createPost(
            env.LINKEDIN_ACCESS_TOKEN || "",
            content,
            file?.buffer
          );
          console.log("LinkedIn post created:", linkedInResponse);
          responseData.post.publishedTo.linkedin = true;
          responseData.post.linkedInResponse = linkedInResponse;
        } catch (linkedInError: any) {
          console.error("Error posting to LinkedIn:", linkedInError);
          responseData.post.publishedTo.linkedin = false;
          responseData.post.errors.linkedin = linkedInError.message;
        }
      }

      // Log the file info if it exists
      if (file) {
        console.log(
          `Processed file: ${file.originalname} (${file.size} bytes)`
        );
      }

      // If both posts failed, return an error
      if (
        publishToFacebook === "true" &&
        publishToLinkedin === "true" &&
        !responseData.post.publishedTo.facebook &&
        !responseData.post.publishedTo.linkedin
      ) {
        return res.status(500).json({
          message: "Failed to post to both Facebook and LinkedIn",
          details: responseData.post.errors,
        });
      }

      // If at least one post was successful, return success
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.error("Error in createPost:", error);
      return res.status(500).json({
        message: "Error creating post",
        error: error.message,
      });
    }
  }
}

// Export controller instance
export const socialMediaController = new SocialMediaController();
