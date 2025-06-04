// langChain service
import { env } from "../config/env.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { prisma } from "../utils/prisma.js";

export class LangChainService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: env.OPENAI_API_KEY,
      modelName: env.OPENAI_MODEL_NAME || "gpt-3.5-turbo",
      temperature: 0.3,
    });
  }

  // Get organization info from database
  private async getOrganizationInfo(orgId: number) {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
      });
      return org || null;
    } catch (error) {
      console.error("Error fetching organization:", error);
      return null;
    }
  }

  // Simple response with context
  async getLangChainResponse(message: string, userId?: number) {
    console.log("Processing message:", { message, userId });

    try {
      // 1. Get organization context if userId is provided
      let orgContext = "";
      if (userId) {
        const org = await this.getOrganizationInfo(userId);
        if (org) {
          orgContext =
            `Organization: ${org.name}\n` +
            (org.category ? `Category: ${org.category}\n` : "") +
            (org.description ? `About: ${org.description}\n` : "");
          orgContext += `Website: ${org.website}\n`;
          orgContext += `Location: ${org.location}\n`;
          orgContext += `Established: ${org.established}\n`;
          orgContext += `Size: ${org.size}\n`;
          orgContext += `Employees: ${org.employees}\n`;
          orgContext += `Revenue: ${org.revenue}\n`;
          orgContext += `Market Area: ${org.marketArea}\n`;
          orgContext += `Description: ${org.description}\n`;
        }
      }

      return this.generateResponse(message, orgContext);
    } catch (error) {
      console.error("Error in getResponse:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  // Generate response with context
  private async generateResponse(
    message: string,
    context: string = ""
  ): Promise<string> {
    const systemMessage = new SystemMessage(`
      You are a helpful assistant. You Just Create post Caption for Social Media.
      ${context ? `\nContext about the organization:\n${context}` : ""}
      if user provide any other information, you should ignore it. and only focus on the organization context.
      And you just need to create post caption for social media. If user message not related to post caption, you should ignore it. and always add website link below the post caption. and always add #Hashtag at the end of the post caption. and try to give detailed post caption.
      Keep responses concise and to the point.
    `);

    const response = await this.model.invoke([
      systemMessage,
      new HumanMessage(message),
    ]);

    return response.content.toString();
  }
}

export const langChainService = new LangChainService();
