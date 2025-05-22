import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware to validate requests using express-validator
 * Checks for validation errors and returns them in a standardized format
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : "",
        message: error.msg,
      })),
    });
  }

  next();
};
