import type { Request, Response, NextFunction, RequestHandler } from "express";
import { Router } from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import { env } from "../config/env.js";
import { facebookAuthCallback, linkedinAuthCallback } from "../controllers/auth-social.controller.js";
import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  ((req: Request, res: Response, next: NextFunction) => {
    register(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  ((req: Request, res: Response, next: NextFunction) => {
    login(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token cookie)
 */
router.post("/refresh", ((req: Request, res: Response, next: NextFunction) => {
  refresh(req, res).catch(next);
}) as RequestHandler);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public
 */
router.post("/logout", ((req: Request, res: Response, next: NextFunction) => {
  logout(req, res).catch(next);
}) as RequestHandler);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticate, ((
  req: Request,
  res: Response,
  next: NextFunction
) => {
  getCurrentUser(req, res).catch(next);
}) as RequestHandler);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  ((req: Request, res: Response, next: NextFunction) => {
    requestPasswordReset(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Alias for forgot-password (for backwards compatibility)
 * @access  Public
 */
router.post(
  "/request-password-reset",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  ((req: Request, res: Response, next: NextFunction) => {
    requestPasswordReset(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  ((req: Request, res: Response, next: NextFunction) => {
    resetPassword(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   GET /api/auth/facebook
 * @desc    Redirect to Facebook OAuth login
 * @access  Public
 */
router.get("/facebook", ((req: Request, res: Response, next: NextFunction) => {
  const { FACEBOOK_APP_ID, REDIRECT_URI, FRONTEND_URL } = env;
  
  if (!FACEBOOK_APP_ID) {
    return res.status(500).json({ message: "Facebook App ID not configured" });
  }

  const redirectUri = `${REDIRECT_URI}/facebook`;
  const scopes = [
    "email",
    "public_profile"
  ];

  // Redirect to Facebook OAuth dialog
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scopes.join(",")}&response_type=code&state=login`;
  
  return res.redirect(authUrl);
}) as RequestHandler);

/**
 * @route   GET /api/auth/callback/facebook
 * @desc    Facebook OAuth callback for login
 * @access  Public
 */
router.get("/callback/facebook", ((req: Request, res: Response, next: NextFunction) => {
  facebookAuthCallback(req, res).catch(next);
}) as RequestHandler);

/**
 * @route   GET /api/auth/linkedin
 * @desc    Redirect to LinkedIn OAuth login
 * @access  Public
 */
router.get("/linkedin", ((req: Request, res: Response, next: NextFunction) => {
  console.log('=== /api/auth/linkedin ===');
  console.log('Request query:', req.query);
  const { LINKEDIN_CLIENT_ID, FRONTEND_URL } = env;
  
  if (!LINKEDIN_CLIENT_ID) {
    return res.status(500).json({ success: false, message: "LinkedIn Client ID not configured" });
  }

  // IMPORTANT: Use a fixed redirect URI that exactly matches what's registered in LinkedIn Developer Portal
  // This must match the authorized redirect URI in LinkedIn Developer Portal
  const redirectUri = 'http://localhost:3000/api/auth/callback';
  
  console.log('Using redirect URI for LinkedIn OAuth:', redirectUri);
  console.log('Original redirect_uri from request:', req.query.redirect_uri);
  
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  console.log('Final redirect URI being used:', redirectUri);
  
  // Only include scopes that are approved in the LinkedIn Developer Portal
  // Make sure these scopes are enabled in your LinkedIn Developer Portal
  const scopes = ["profile", "w_member_social"];
  console.log('Requesting scopes:', scopes);

  // State parameter can be used to track the user's intended destination after auth
  const state = req.query.state || 'login';

  // Redirect to LinkedIn authorization page
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&scope=${scopes.join("%20")}&state=${state}`;
  
  console.log('Generated LinkedIn auth URL (partial):', 
    authUrl.substring(0, 100) + (authUrl.length > 100 ? '...' : '')
  );
  
  console.log(`Redirecting to LinkedIn OAuth: ${authUrl}`);
  return res.redirect(authUrl);
}) as RequestHandler);

/**
 * @route   GET /api/auth/callback/linkedin
 * @desc    LinkedIn callback route that the LinkedIn OAuth flow redirects to
 */
router.get("/callback/linkedin", ((req: Request, res: Response, next: NextFunction) => {
  // Always set the response type to JSON to prevent HTML responses
  res.setHeader('Content-Type', 'application/json');

  try {
    console.log("LinkedIn callback received");
    console.log("Query parameters:", req.query);
    
    // Extract code and state from query parameters
    const { code, state } = req.query;
    
    if (!code) {
      console.error("No code provided in callback");
      const errorResponse = { success: false, message: "No code provided in callback" };
      console.log('Sending error response:', errorResponse);
      return res.status(400).json(errorResponse);
    }
    
    // Call the LinkedIn controller to handle the callback
    // We need to be careful with the promise handling here because 'res' might be used after the response is sent
    linkedinAuthCallback(req, res).catch((error) => {
      // Only send a response if headers have not been sent already
      if (!res.headersSent) {
        console.error("Error in LinkedIn callback:", error);
        const errorResponse = { 
          success: false, 
          message: "Failed to process LinkedIn authentication. Please try again.",
          error: error.message
        };
        console.log('Sending error response:', errorResponse);
        return res.status(500).json(errorResponse);
      } else {
        console.error("Cannot send error response as headers already sent:", error);
      }
    });
  } catch (error: any) {
    // Only send a response if headers have not been sent already
    if (!res.headersSent) {
      console.error('LinkedIn auth callback outer error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'LinkedIn authentication failed'
      });
    } else {
      console.error("Cannot send error response as headers already sent:", error);
    }
  }
}) as RequestHandler);

export default router;
