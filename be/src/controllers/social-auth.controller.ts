import type { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "../config/env.js";

const prisma = new PrismaClient();

/**
 * File has been simplified to only include token management functionality
 * OAuth login functionality has been removed
 */

/**
 * Check connection status for social accounts
 */
export const checkSocialConnections = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      // Query only fields that exist in the schema
      select: {
        linkedInToken: true, // Use the actual field names from your schema
      },
    });
    
    return res.status(200).json({
      // Check if the token exists to determine connection status
      linkedin: !!user?.linkedInToken,
    });
  } catch (error) {
    console.error("Error checking social connections:", error);
    return res.status(500).json({ 
      message: "Failed to check social connections",
      error: error instanceof Error ? error.message : "Unknown error", 
    });
  }
};

/**
 * Disconnect LinkedIn account
 */
export const disconnectSocialAccount = async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (platform !== "linkedin") {
      return res
        .status(400)
        .json({ message: "Invalid platform - only LinkedIn is supported" });
    }

    // Update user record to remove LinkedIn token
    // Use actual field names from the schema
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        linkedInToken: null,
      } as Prisma.UserUpdateInput,
    });

    return res.status(200).json({ message: `Disconnected from LinkedIn` });
  } catch (error) {
    const err = error as Error;
    console.error("Disconnect LinkedIn account error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error disconnecting account" });
  }
};
