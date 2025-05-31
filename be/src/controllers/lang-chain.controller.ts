// LangChain Controller
import { Request, Response } from "express";
import { langChainService } from "../services/lang-chain.service.js";

// implement it
export class LangChainController {
  async getLangChainResponse(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      console.log(message);
      // ned open ai langChain
      const result = await langChainService.getLangChainResponse(message);
      res.status(200).json({
        success: true,
        message: "LangChain response generated successfully.",
        data: result,
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
