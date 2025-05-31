// langChain service
import { env } from "../config/env.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class LangChainService {
  getLangChainResponse(message: string, userId?: number) {
    console.log("LangChainService: ", message);
    console.log("User ID:", userId);
    const model = new ChatOpenAI({
      apiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4o",
    });
    const response = model.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage(message),
    ]);
    return response;
  }
}

export const langChainService = new LangChainService();
