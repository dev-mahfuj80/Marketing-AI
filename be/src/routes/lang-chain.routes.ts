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
export const langChainRoutes = Router();

// Helper to wrap async route handlers to properly handle promise rejections
const asyncHandler =
  (fn: Function): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

//================================== LANG-CHAIN ROUTES ====================================

//get langChain response
langChainRoutes.post(
  "/lang-chain",
  authenticate,
  asyncHandler(langChainController.getLangChainResponse)
);
