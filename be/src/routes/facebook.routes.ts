import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { facebookController } from "../controllers/facebook.controller.js";
import { facebookStatusController } from "../controllers/facebook-status.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * @route   GET /api/facebook/pages/:pageId/posts
 * @desc    Get posts from a Facebook page using PAGE_ACCESS_TOKEN from env
 * @access  Private
 */
router.get(
  "/pages/:pageId/posts",
  authenticate,
  asyncHandler(facebookController.getPagePosts)
);

/**
 * @route   POST /api/facebook/pages/:pageId/publish
 * @desc    Publish a post to a Facebook page using PAGE_ACCESS_TOKEN from env
 * @access  Private
 */
router.post(
  "/pages/:pageId/publish",
  authenticate,
  asyncHandler(facebookController.publishPagePost)
);

/**
 * @route   GET /api/facebook/status
 * @desc    Check Facebook connection status and permissions
 * @access  Public - No authentication required to check API credential status
 */
router.get("/status", asyncHandler(facebookStatusController.checkStatus));

export default router;
