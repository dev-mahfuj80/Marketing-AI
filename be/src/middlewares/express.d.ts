import { Request, Response, NextFunction } from "express";

// Extend Express module to accept handlers that return Response or Promise<Response>
declare global {
  namespace Express {
    interface RequestHandler {
      (req: Request, res: Response, next: NextFunction):
        | void
        | Response
        | Promise<void | Response | undefined>;
    }
  }
}
