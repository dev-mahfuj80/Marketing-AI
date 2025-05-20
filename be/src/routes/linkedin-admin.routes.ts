import { Router } from "express";
import { LinkedInAdminController } from "../controllers/linkedin-admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const linkedInAdminController = new LinkedInAdminController();

// Route to initiate the LinkedIn OAuth flow (admin only)
router.get("/auth", authenticate, authorize(["ADMIN"]), linkedInAdminController.initiateOAuth);

// Callback route for LinkedIn OAuth - no auth required for the callback
router.get("/callback", linkedInAdminController.handleOAuthCallback);

// Route to check if admin has linked their LinkedIn account
router.get("/status", authenticate, linkedInAdminController.getLinkedInStatus);

// Route to revoke the LinkedIn connection
router.post("/revoke", authenticate, authorize(["ADMIN"]), linkedInAdminController.revokeAccess);

export default router;
