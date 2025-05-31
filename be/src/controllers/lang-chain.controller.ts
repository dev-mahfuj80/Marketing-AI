// LangChain Controller
import { Request, Response } from "express";
import { langChainService } from "../services/lang-chain.service.js";

// Extended Request type to include authenticated user
interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export class LangChainController {
  /**
   * Generate post content using OpenAI
   * This endpoint passes the user's ID to fetch organization information for context
   */
  async getLangChainResponse(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { content } = req.body;
      const userId = req.user?.id;

      console.log("LangChainController input:", content);
      console.log("User ID:", userId);

      // Generate content using OpenAI, passing userId for organization context
      const result = await langChainService.getLangChainResponse(
        content,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Content generated successfully.",
        content: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while processing your request.",
      });
      return;
    }
  }
}

export const langChainController = new LangChainController();
