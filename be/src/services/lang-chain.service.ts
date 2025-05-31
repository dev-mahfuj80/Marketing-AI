// langChain service

export class LangChainService {
  getLangChainResponse(message: string) {
    console.log("LangChainService: ", message);
    return message;
  }
}

export const langChainService = new LangChainService();
