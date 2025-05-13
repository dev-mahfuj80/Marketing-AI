import type { Request, Response, NextFunction, RequestHandler } from "express";
import { Router } from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

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

export default router;
