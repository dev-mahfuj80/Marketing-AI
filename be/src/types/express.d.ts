import { Request } from "express";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  organizations?: {
    id: number;
    name: string;
    website: string;
    category: string;
    location: string;
    description: string;
    established: string;
    size: string;
    employees: string;
    revenue: string;
    marketArea: string;
  }[];
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
