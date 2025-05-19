import type { Request, Response, NextFunction } from "express";
import { FacebookService } from "../services/facebook.service.js";
import { env } from "../config/env.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import util from "util";

// Extend Request type to include file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const uploadMiddleware = upload.single('image');
const uploadAsync = util.promisify(uploadMiddleware);

/**
 * Simplified Facebook controller for page management using direct page access token
 */
export const facebookController = {
  /**
   * Get posts from the Facebook page using the PAGE_ACCESS_TOKEN in .env
   */
  getPagePosts: async (req: Request, res: Response) => {
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
      const posts = await facebookService.getPagePosts(
        pageId,
        env.FACEBOOK_PAGE_ACCESS_TOKEN,
        Number(limit)
      );

      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching Facebook page posts:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch Facebook page posts" });
    }
  },

  /**
   * Publish a post to a Facebook page using the PAGE_ACCESS_TOKEN in .env
   */
  publishPagePost: async (req: MulterRequest, res: Response) => {
    try {
      // Default to the page ID in the environment or use the one from the request
      const pageId = req.params.pageId || env.FACEBOOK_PAGE_ID;
      
      // Process file upload if present - do this BEFORE we try to access body
      try {
        await uploadAsync(req, res);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(400).json({ message: 'File upload failed' });
      }

      // Now we can safely access the body
      // Initialize message and link in case req.body is undefined
      let message = '';
      let link = undefined;

      // Safely access req.body properties
      if (req.body) {
        message = req.body.message || '';
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

      // File upload has already been processed above

      const facebookService = new FacebookService();
      let result;

      // Check if we have an image file
      if (req.file) {
        console.log('Image file detected, uploading to Facebook');
        // Get image buffer from multer
        const imageBuffer = req.file.buffer;
        
        result = await facebookService.publishPagePost(
          pageId,
          env.FACEBOOK_PAGE_ACCESS_TOKEN,
          message,
          link,
          imageBuffer
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
  },
};
