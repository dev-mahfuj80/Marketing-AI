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
  const { LINKEDIN_CLIENT_ID, REDIRECT_URI, FRONTEND_URL } = env;
  
  if (!LINKEDIN_CLIENT_ID) {
    return res.status(500).json({ message: "LinkedIn Client ID not configured" });
  }

  const redirectUri = `${REDIRECT_URI}/linkedin`;
  const scopes = ["r_liteprofile", "r_emailaddress"];

  // Redirect to LinkedIn authorization page
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=login`;
  
  return res.redirect(authUrl);
}) as RequestHandler);

/**
 * @route   GET /api/auth/callback/linkedin
 * @desc    LinkedIn OAuth callback for login
 * @access  Public
 */
router.get("/callback/linkedin", ((req: Request, res: Response, next: NextFunction) => {
  linkedinAuthCallback(req, res).catch(next);
}) as RequestHandler);

export default router;
