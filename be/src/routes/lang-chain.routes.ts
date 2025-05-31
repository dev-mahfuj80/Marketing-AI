import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { langChainController } from "../controllers/lang-chain.controller.js";

// LangChain Routes
export const router = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

//================================== LANG-CHAIN ROUTES ====================================

//get langChain response
router.post(
  "/",
  authenticate,
  asyncHandler(langChainController.getLangChainResponse)
);

export default router;
