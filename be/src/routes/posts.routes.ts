import { Router } from 'express';
import {
  getFacebookPosts,
  getLinkedInPosts,
  createPost,
} from '../controllers/posts.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/posts/facebook
 * @desc    Get Facebook posts
 * @access  Private
 */
router.get('/facebook', authenticate, getFacebookPosts);

/**
 * @route   GET /api/posts/linkedin
 * @desc    Get LinkedIn posts
 * @access  Private
 */
router.get('/linkedin', authenticate, getLinkedInPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', authenticate, createPost);

export default router;
