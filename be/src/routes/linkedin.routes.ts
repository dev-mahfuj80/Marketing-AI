import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { linkedinController } from "../controllers/linkedin.controller.js";
import { linkedInStatusController } from "../controllers/linkedin-status.controller.js";
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
 * @route   GET /api/linkedin/auth
 * @desc    Get LinkedIn authorization URL
 * @access  Private - User must be logged in to connect their LinkedIn account
 */
router.get("/auth", authenticate, asyncHandler(linkedinController.getAuthUrl));

/**
 * @route   GET /api/linkedin/callback
 * @desc    Handle LinkedIn OAuth callback
 * @access  Public - No authentication, but validates state parameter
 */
router.get("/callback", asyncHandler(linkedinController.handleCallback));

// Export the router for use in the auth routes

/**
 * @route   POST /api/linkedin/disconnect
 * @desc    Disconnect LinkedIn account
 * @access  Private - User must be logged in
 */
router.post("/disconnect", authenticate, asyncHandler(linkedinController.disconnect));

/**
 * @route   GET /api/linkedin/status
 * @desc    Check LinkedIn connection status
 * @access  Public - No authentication required to check API credential status
 */
router.get("/status", asyncHandler(linkedInStatusController.checkStatus));

/**
 * @route   GET /api/linkedin/profile
 * @desc    Get LinkedIn user profile information (available with basic permissions)
 * @access  Private - User must be logged in
 */
router.get("/profile", authenticate, asyncHandler(linkedinController.getProfileInfo));

/**
 * @route   POST /api/linkedin/refresh-token
 * @desc    Refresh the LinkedIn access token
 * @access  Private - User must be logged in
 */
router.post("/refresh-token", authenticate, asyncHandler(linkedinController.refreshToken));

export default router;
