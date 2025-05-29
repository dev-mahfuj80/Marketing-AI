import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { env } from "../config/env.js";
import multer from "multer";
import util from "util";
import { FacebookService } from "../services/social.service.js";
import { LinkedInService } from "../services/social.service.js";

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
      const facebookService = new FacebookService();
      const result = await facebookService.getFacebookProfileStatus(
        env.FACEBOOK_PAGE_ACCESS_TOKEN
      );
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
      // get linkedin access token from env
      const linkedinAccessToken = env.LINKEDIN_ACCESS_TOKEN;
      if (!linkedinAccessToken) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          profileInfo: null,
          message: "LinkedIn access token not configured",
          lastChecked: new Date().toISOString(),
          error: "LinkedIn access token not configured",
        });
      }

      const linkedInService = new LinkedInService();
      const profileResponse = await linkedInService.getLinkedInProfileStatus(
        linkedinAccessToken
      );

      if (profileResponse && profileResponse.id) {
        return res.status(200).json({
          connected: true,
          credentialsValid: true,
          profileInfo: profileResponse,
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
      console.log("Received post data:", req.body);
      
      if (!req.body) {
        return res.status(400).json({ message: "No post data provided" });
      }

      // Get the file from the request if it was uploaded
      const file = (req as any).file;
      
      // Prepare the response data
      const responseData: any = {
        message: "Post created successfully",
        post: {
          ...req.body,
          hasImage: !!file,
          imageInfo: file ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          } : null
        }
      };

      // If you need to process the file, you can access it here
      if (file) {
        // Example: file.buffer contains the file data
        console.log(`Received file: ${file.originalname} (${file.size} bytes)`);
      }

      return res.status(200).json(responseData);
    } catch (error: any) {
      console.error("Error creating post:", error);
      return res.status(500).json({ 
        message: "Server error creating post",
        error: error.message 
      });
    }
  }
}

// Export controller instance
export const socialMediaController = new SocialMediaController();
