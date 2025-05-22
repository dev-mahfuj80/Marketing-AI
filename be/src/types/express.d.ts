import { Request } from "express";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
