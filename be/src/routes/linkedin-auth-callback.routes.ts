import { Router } from "express";
import { linkedinController } from "../controllers/linkedin.controller.js";
import type { Request, Response, NextFunction, RequestHandler } from "express";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * @route   GET /api/auth/linkedin/callback
 * @desc    Handle LinkedIn OAuth callback
 * @access  Public - No authentication, but validates state parameter
 */
router.get("/linkedin/callback", asyncHandler(linkedinController.handleCallback));

export default router;
