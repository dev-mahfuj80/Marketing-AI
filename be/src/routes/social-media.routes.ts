import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { socialMediaController } from "../controllers/social-media.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

//========================================== FACEBOOK ROUTES ====================================

//check facebook status
router.get(
  "/facebook/status",
  asyncHandler(socialMediaController.checkFacebookStatus)
);

//get facebook posts
router.get(
  "/facebook/posts",
  authenticate,
  asyncHandler(socialMediaController.getFacebookPosts)
);

//get facebook page posts
router.get(
  "/facebook/pages/:pageId/posts",
  authenticate,
  asyncHandler(socialMediaController.getFacebookPosts)
);

//publish facebook page post
router.post(
  "/facebook/pages/:pageId/publish",
  authenticate,
  asyncHandler(socialMediaController.publishPagePost)
);

//========================================== LINKEDIN ROUTES ====================================

//get linkedin profile info
router.get(
  "/linkedin/profile",
  authenticate,
  asyncHandler(socialMediaController.getLinkedInProfile)
);

//check linkedin status
router.get(
  "/linkedin/status",
  asyncHandler(socialMediaController.checkLinkedInStatus)
);

//get linkedin page posts
router.get(
  "/linkedin/page/posts",
  asyncHandler(socialMediaController.getLinkedInPagePosts)
);

//publish linkedin page post
router.post(
  "/linkedin/page/publish",
  authenticate,
  asyncHandler(socialMediaController.publishLinkedInPost)
);

//========================================== CROSS-PLATFORM ROUTES ====================================

//create post
router.post(
  "/posts",
  authenticate,
  asyncHandler(socialMediaController.createPost)
);

export default router;
