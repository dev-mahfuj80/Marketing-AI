import { Router } from 'express';
import {
  initiateOAuthFacebook,
  facebookCallback,
  initiateOAuthLinkedIn,
  linkedInCallback,
  disconnectSocialAccount,
} from '../controllers/social-auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/social/facebook
 * @desc    Initiate Facebook OAuth flow
 * @access  Private
 */
router.get('/facebook', authenticate, initiateOAuthFacebook);

/**
 * @route   GET /api/social/facebook/callback
 * @desc    Facebook OAuth callback handler
 * @access  Private
 */
router.get('/facebook/callback', authenticate, facebookCallback);

/**
 * @route   GET /api/social/linkedin
 * @desc    Initiate LinkedIn OAuth flow
 * @access  Private
 */
router.get('/linkedin', authenticate, initiateOAuthLinkedIn);

/**
 * @route   GET /api/social/linkedin/callback
 * @desc    LinkedIn OAuth callback handler
 * @access  Private
 */
router.get('/linkedin/callback', authenticate, linkedInCallback);

/**
 * @route   DELETE /api/social/:platform/disconnect
 * @desc    Disconnect social media account
 * @access  Private
 */
router.delete('/:platform/disconnect', authenticate, disconnectSocialAccount);

export default router;
