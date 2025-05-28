import type { Request, Response, NextFunction, RequestHandler } from "express";
import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  updateUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

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

router.post("/refresh", ((req: Request, res: Response, next: NextFunction) => {
  refresh(req, res).catch(next);
}) as RequestHandler);

router.post("/logout", ((req: Request, res: Response, next: NextFunction) => {
  logout(req, res).catch(next);
}) as RequestHandler);

router.get("/me", authenticate, ((
  req: Request,
  res: Response,
  next: NextFunction
) => {
  getCurrentUser(req, res).catch(next);
}) as RequestHandler);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  ((req: Request, res: Response, next: NextFunction) => {
    requestPasswordReset(req, res).catch(next);
  }) as RequestHandler
);

router.post(
  "/request-password-reset",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  ((req: Request, res: Response, next: NextFunction) => {
    requestPasswordReset(req, res).catch(next);
  }) as RequestHandler
);

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

router.post(
  "/update-user",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
  ],

  authenticate,
  ((req: Request, res: Response, next: NextFunction) => {
    updateUser(req, res).catch(next);
  }) as RequestHandler
);

export default router;
