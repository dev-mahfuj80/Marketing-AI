import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import axios from "axios";
import { env } from "../config/env.js";
import { socialMediaController } from "../controllers/social-media.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * FACEBOOK ROUTES
 */

/**
 * @route   GET /api/social/facebook/status
 * @desc    Check Facebook connection status and permissions
 * @access  Public - No authentication required to check API credential status
 */
router.get(
  "/facebook/status", 
  asyncHandler(socialMediaController.checkFacebookStatus)
);

/**
 * @route   GET /api/social/facebook/posts
 * @desc    Get Facebook posts for the authenticated user
 * @access  Private
 */
router.get(
  "/facebook/posts", 
  authenticate, 
  asyncHandler(socialMediaController.getFacebookPosts)
);

/**
 * @route   GET /api/social/facebook/pages/:pageId/posts
 * @desc    Get posts from a Facebook page using PAGE_ACCESS_TOKEN from env
 * @access  Private
 */
router.get(
  "/facebook/pages/:pageId/posts",
  authenticate,
  asyncHandler(socialMediaController.getPagePosts)
);

/**
 * @route   POST /api/social/facebook/pages/:pageId/publish
 * @desc    Publish a post to a Facebook page using PAGE_ACCESS_TOKEN from env
 * @access  Private
 */
router.post(
  "/facebook/pages/:pageId/publish",
  authenticate,
  asyncHandler(socialMediaController.publishPagePost)
);

/**
 * LINKEDIN ROUTES
 */

/**
 * @route   GET /api/social/linkedin/status
 * @desc    Check LinkedIn connection status and permissions
 * @access  Public - No authentication required to check API credential status
 */
router.get(
  "/linkedin/status", 
  asyncHandler(socialMediaController.checkLinkedInStatus)
);

/**
 * @route   GET /api/social/linkedin/test-token
 * @desc    Test endpoint to verify LinkedIn token works
 * @access  Public - No authentication required
 */
router.get(
  "/linkedin/test-token",
  asyncHandler(async (req: Request, res: Response) => {
    const token = env.LINKEDIN_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({ error: "No LinkedIn token configured" });
    }
    
    try {
      // Make a direct API call to LinkedIn
      const response = await axios.get("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Restli-Protocol-Version": "2.0.0"
        }
      });
      
      console.log("LinkedIn API test successful:", response.data);
      return res.json({
        success: true,
        profile: response.data,
        message: "LinkedIn token is valid"
      });
    } catch (error: any) {
      console.error("LinkedIn API test failed:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        success: false,
        error: error.response?.data || error.message,
        message: "LinkedIn token test failed"
      });
    }
  })
);

/**
 * @route   GET /api/social/linkedin/posts
 * @desc    Get LinkedIn posts for the authenticated user
 * @access  Private
 */
router.get(
  "/linkedin/posts", 
  authenticate, 
  asyncHandler(socialMediaController.getLinkedInPosts)
);

/**
 * @route   GET /api/social/linkedin/page/posts
 * @desc    Get LinkedIn posts using the ACCESS_TOKEN in .env
 * @access  Public - Uses environment variable token instead of user token
 */
router.get(
  "/linkedin/page/posts", 
  asyncHandler(socialMediaController.getLinkedInPagePosts)
);

/**
 * @route   POST /api/social/linkedin/page/publish
 * @desc    Publish a post to LinkedIn using the ACCESS_TOKEN in .env
 * @access  Private - Requires authentication but uses environment variable token
 */
router.post(
  "/linkedin/page/publish", 
  authenticate,
  asyncHandler(socialMediaController.publishLinkedInPost)
);

/**
 * CROSS-PLATFORM ROUTES
 */

/**
 * @route   POST /api/social/posts
 * @desc    Create a new post on multiple platforms
 * @access  Private
 */
router.post(
  "/posts", 
  authenticate, 
  asyncHandler(socialMediaController.createPost)
);

export default router;
