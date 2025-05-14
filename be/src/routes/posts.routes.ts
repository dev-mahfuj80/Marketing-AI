import { Router } from "express";
import {
  getFacebookPosts,
  getLinkedInPosts,
  createPost,
} from "../controllers/posts.controller.js";

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   GET /api/posts/facebook
 * @desc    Get Facebook posts
 * @access  Private
 */
router.get("/facebook", authenticate, asyncHandler(getFacebookPosts));

/**
 * @route   GET /api/posts/linkedin
 * @desc    Get LinkedIn posts
 * @access  Private
 */
router.get("/linkedin", authenticate, asyncHandler(getLinkedInPosts));

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post("/", authenticate, asyncHandler(createPost));

export default router;
