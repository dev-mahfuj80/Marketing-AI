import type { Request, Response } from 'express';
import { FacebookService } from '../services/facebook.service.js';
import { env } from '../config/env.js';

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
      const pageId = req.params.pageId || env.FACEBOOK_PAGE_ID || 'me';
      
      if (!env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res.status(500).json({ message: 'Facebook page access token not configured' });
      }

      const facebookService = new FacebookService();
      const posts = await facebookService.getPagePosts(
        pageId, 
        env.FACEBOOK_PAGE_ACCESS_TOKEN, 
        Number(limit)
      );
      
      return res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching Facebook page posts:', error);
      return res.status(500).json({ message: 'Failed to fetch Facebook page posts' });
    }
  },

  /**
   * Publish a post to a Facebook page using the PAGE_ACCESS_TOKEN in .env
   */
  publishPagePost: async (req: Request, res: Response) => {
    try {
      // Default to the page ID in the environment or use the one from the request
      const pageId = req.params.pageId || env.FACEBOOK_PAGE_ID;
      const { message, link } = req.body;
      
      if (!pageId || !message) {
        return res.status(400).json({ message: 'Page ID and message are required' });
      }
      
      if (!env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        return res.status(500).json({ message: 'Facebook page access token not configured' });
      }

      const facebookService = new FacebookService();
      const result = await facebookService.publishPagePost(
        pageId, 
        env.FACEBOOK_PAGE_ACCESS_TOKEN, 
        message, 
        link
      );
      
      return res.status(200).json({ 
        message: 'Post published successfully', 
        postId: result.id 
      });
    } catch (error) {
      console.error('Error publishing Facebook post:', error);
      return res.status(500).json({ message: 'Failed to publish Facebook post' });
    }
  }
};
