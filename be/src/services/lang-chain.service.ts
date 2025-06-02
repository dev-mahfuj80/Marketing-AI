// langChain service
import { env } from "../config/env.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentExecutor } from "langchain/agents";
import { AgentFinish, AgentAction } from "@langchain/core/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessageChunk } from "@langchain/core/messages";
import { SearchApi } from "@langchain/community/tools/searchapi";
export class LangChainService {
  getLangChainResponse(message: string, userId?: number) {
    console.log("LangChainService: ", message);
    console.log("User ID:", userId);
    const model = new ChatOpenAI({
      apiKey: env.OPENAI_API_KEY,
      modelName: env.OPENAI_MODEL_NAME,
    });
    const response = model.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage(message),
    ]);
    return response;
  }
}

export const langChainService = new LangChainService();
