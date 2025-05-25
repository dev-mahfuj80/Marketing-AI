import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
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
 * @route   GET /api/social/linkedin/posts
 * @desc    Get LinkedIn posts
 * @access  Private
 */
router.get(
  "/linkedin/posts", 
  authenticate, 
  asyncHandler(socialMediaController.getLinkedInPosts)
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
