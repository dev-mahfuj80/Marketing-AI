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
    return res.status(500).json({ message: "LinkedIn Client ID not configured" });
  }

  // Use the provided redirect_uri or fallback to the default one
  let redirectUri = `${FRONTEND_URL}/`;
  
  // If no redirect_uri is provided, use the default one from the frontend
  if (req.query.redirect_uri) {
    try {
      const customUri = new URL(req.query.redirect_uri as string);
      const frontendUrl = new URL(FRONTEND_URL);
      
      // Only allow redirects to the same origin as our frontend
      if (customUri.origin === frontendUrl.origin) {
        redirectUri = customUri.href;
      } else {
        console.warn('Invalid redirect_uri domain, using default');
      }
    } catch (e) {
      console.warn('Invalid redirect_uri, using default:', e);
    }
  }
  
  console.log('Original redirect_uri from request:', req.query.redirect_uri);
  
  if (req.query.redirect_uri) {
    try {
      // Ensure the redirect_uri is a valid URL and belongs to our frontend
      const customUri = new URL(req.query.redirect_uri as string);
      const frontendUrl = new URL(FRONTEND_URL);
      
      if (customUri.origin === frontendUrl.origin) {
        redirectUri = customUri.href;
      } else {
        console.warn('Invalid redirect_uri domain, using default');
      }
    } catch (e) {
      console.warn('Invalid redirect_uri, using default:', e);
    }
  }
  
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  console.log('Final redirect URI being used:', redirectUri);
  
  // Only include scopes that are approved in the LinkedIn Developer Portal
  // Note: r_liteprofile is deprecated, using 'profile' instead
  const scopes = ["profile", "w_member_social"];
  console.log('Requesting scopes:', scopes);

  // Redirect to LinkedIn authorization page
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&scope=${scopes.join("%20")}&state=login`;
  
  console.log('Generated LinkedIn auth URL (partial):', 
    authUrl.substring(0, 100) + (authUrl.length > 100 ? '...' : '')
  );
  
  console.log(`Redirecting to LinkedIn OAuth: ${authUrl}`);
  return res.redirect(authUrl);
}) as RequestHandler);

/**
 * @route   GET /api/auth/callback/linkedin
 * @desc    LinkedIn OAuth callback for login
 * @access  Public
 */
router.get("/callback/linkedin", ((req: Request, res: Response, next: NextFunction) => {
  console.log('LinkedIn callback received:', req.query);
  
  const { code, state } = req.query;
  
  if (!code) {
    console.error('LinkedIn callback missing code parameter');
    return res.status(400).json({
      success: false,
      message: 'Missing required parameter: code'
    });
  }
  
  // Handle the callback - this should create a JWT and set cookies
  try {
    // This will need to authenticate or link the LinkedIn account
    linkedinAuthCallback(req, res).catch((error) => {
      console.error('LinkedIn auth callback error:', error);
      // Return JSON response for the frontend to handle
      res.status(500).json({
        success: false,
        message: error.message || 'LinkedIn authentication failed'
      });
    });
  } catch (error: any) {
    console.error('LinkedIn auth callback outer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'LinkedIn authentication failed'
    });
  }
}) as RequestHandler);

export default router;
