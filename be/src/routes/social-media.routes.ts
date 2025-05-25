import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import axios from "axios";
import { env } from "../config/env.js";
import { socialMediaController } from "../controllers/social-media.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

//============================================================= FACEBOOK ROUTES =============================================================

router.get(
  "/facebook/status", 
  asyncHandler(socialMediaController.checkFacebookStatus)
);

router.get(
  "/facebook/posts", 
  authenticate, 
  asyncHandler(socialMediaController.getFacebookPosts)
);

router.get(
  "/facebook/pages/:pageId/posts",
  authenticate,
  asyncHandler(socialMediaController.getPagePosts)
);

router.post(
  "/facebook/pages/:pageId/publish",
  authenticate,
  asyncHandler(socialMediaController.publishPagePost)
);

//============================================================= LINKEDIN ROUTES =============================================================

router.get(
  "/linkedin/status", 
  asyncHandler(socialMediaController.checkLinkedInStatus)
);

router.get(
  "/linkedin/page/posts", 
  asyncHandler(socialMediaController.getLinkedInPagePosts)
);

router.post(
  "/linkedin/page/publish", 
  authenticate,
  asyncHandler(socialMediaController.publishLinkedInPost)
);

//============================================================= CROSS-PLATFORM ROUTES =============================================================

router.post(
  "/posts", 
  authenticate, 
  asyncHandler(socialMediaController.createPost)
);

export default router;
