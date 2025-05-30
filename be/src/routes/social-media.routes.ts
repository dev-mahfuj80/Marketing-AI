import { Router } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { socialMediaController } from "../controllers/social-media.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

//================================== FACEBOOK ROUTES ====================================

//check facebook status
router.get(
  "/facebook/status",
  asyncHandler(socialMediaController.getFacebookProfileStatus)
);

//get facebook page posts
router.get(
  "/facebook/pages/:pageId/posts",
  authenticate,
  asyncHandler(socialMediaController.getFacebookPosts)
);

//================================== LINKEDIN ROUTES ====================================

//get linkedin profile info
router.get(
  "/linkedin/status",
  authenticate,
  asyncHandler(socialMediaController.getLinkedInProfileStatus)
);

//get linkedin page posts
router.get(
  "/linkedin/page/posts",
  asyncHandler(socialMediaController.getLinkedInPagePosts)
);

//================================== CROSS-PLATFORM ROUTES ====================================

router.post(
  "/posts",
  authenticate,
  upload.single("image"),
  asyncHandler(socialMediaController.createPost)
);

export default router;
