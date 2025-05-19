import type { Request, Response } from "express";
import { LinkedInService } from "../services/linkedin.service.js";
import { env } from "../config/env.js";

/**
 * LinkedIn controller for API interactions using client credentials directly
 */
export const linkedinController = {
  /**
   * Get LinkedIn posts using client credentials
   */
  getPosts: async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.query;

      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
        return res
          .status(500)
          .json({ message: "LinkedIn credentials not configured" });
      }

      const linkedinService = new LinkedInService();
      const posts = await linkedinService.getPosts(Number(limit));

      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching LinkedIn posts:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch LinkedIn posts" });
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
   * This simply checks if we have valid credentials configured
   */
  getConnectionStatus: async (req: Request, res: Response) => {
    try {
      const isConnected = !!(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET);
      
      return res.status(200).json({
        connected: isConnected,
        lastSync: isConnected ? new Date().toISOString() : null,
      });
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
      return res
        .status(500)
        .json({ message: "Failed to check LinkedIn connection" });
    }
  },
};
