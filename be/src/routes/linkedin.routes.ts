import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { linkedinController } from "../controllers/linkedin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * @route   GET /api/linkedin/posts
 * @desc    Get LinkedIn posts
 * @access  Private
 */
router.get("/posts", authenticate, asyncHandler(linkedinController.getPosts));

/**
 * @route   POST /api/linkedin/posts
 * @desc    Publish a post to LinkedIn
 * @access  Private
 */
router.post("/posts", authenticate, asyncHandler(linkedinController.publishPost));

/**
 * @route   GET /api/linkedin/status
 * @desc    Check LinkedIn connection status
 * @access  Private
 */
router.get("/status", authenticate, asyncHandler(linkedinController.getConnectionStatus));

export default router;
