// LangChain Controller
import { Request, Response } from "express";
import { langChainService } from "../services/lang-chain.service.js";

// implement it
export class LangChainController {
  async getLangChainResponse(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;
      console.log("LangChainController: ", req.body);
      // ned open ai langChain
      const result = await langChainService.getLangChainResponse(content);
      res.status(200).json({
        success: true,
        message: "LangChain response generated successfully.",
        content: result,
      });
    } catch (error) {
      console.error("Error in getLangChainResponse controller:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing your request.",
      });
    }
  }
}

export const langChainController = new LangChainController();
