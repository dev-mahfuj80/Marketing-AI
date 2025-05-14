import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import {
  initiateOAuthFacebook,
  facebookCallback,
  initiateOAuthLinkedIn,
  linkedInCallback,
  disconnectSocialAccount,
} from "../controllers/social-auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler = (fn: Function): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @route   GET /api/social/facebook
 * @desc    Initiate Facebook OAuth flow
 * @access  Private
 */
router.get("/facebook", authenticate, asyncHandler(initiateOAuthFacebook));

/**
 * @route   GET /api/social/facebook/callback
 * @desc    Facebook OAuth callback handler
 * @access  Private
 */
router.get("/facebook/callback", authenticate, asyncHandler(facebookCallback));

/**
 * @route   GET /api/social/linkedin
 * @desc    Initiate LinkedIn OAuth flow
 * @access  Private
 */
router.get("/linkedin", authenticate, asyncHandler(initiateOAuthLinkedIn));

/**
 * @route   GET /api/social/linkedin/callback
 * @desc    LinkedIn OAuth callback handler
 * @access  Private
 */
router.get("/linkedin/callback", authenticate, asyncHandler(linkedInCallback));

/**
 * @route   DELETE /api/social/:platform/disconnect
 * @desc    Disconnect social media account
 * @access  Private
 */
router.delete("/:platform/disconnect", authenticate, asyncHandler(disconnectSocialAccount));

export default router;
