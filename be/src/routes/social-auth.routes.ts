import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import {
  checkSocialConnections,
  disconnectSocialAccount,
} from "../controllers/social-auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * @route   GET /api/social/status
 * @desc    Check social media connection status
 * @access  Private
 */
router.get("/status", authenticate, asyncHandler(checkSocialConnections));

/**
 * @route   DELETE /api/social/:platform/disconnect
 * @desc    Disconnect a social media account
 * @access  Private
 */
router.delete(
  "/:platform/disconnect",
  authenticate,
  asyncHandler(disconnectSocialAccount)
);

export default router;
