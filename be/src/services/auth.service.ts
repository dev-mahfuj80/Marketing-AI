// be/src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/email.js";
const prisma = new PrismaClient();

import { hashPassword, verifyPassword, generateTokens } from "../utils/auth.js";
import { env } from "../config/env.js";
export const AuthService = {
  async register(name: string, email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          status: 400,
          message: "User already exists",
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Generate tokens
      const tokens = await generateTokens(user);

      // Prepare user data without sensitive information
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      console.error("Registration service error:", error);
      throw error;
    }
  },
  // Login existing user
  async login(email: string, password: string) {
    try {
      // Check database connection
      try {
        await prisma.$connect();
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        throw new Error("Database connection error");
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Check if user exists
      if (!user) {
        return {
          success: false,
          status: 404,
          message: "Account not found. Please sign up first.",
          code: "USER_NOT_FOUND",
        };
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          status: 401,
          message: "Invalid credentials",
        };
      }

      // Generate tokens
      const tokens = await generateTokens(user);

      // Handle social tokens if needed
      await this.handleSocialTokens(user);

      // Prepare user data without sensitive information
      const {
        password: _,
        linkedInAccessToken: _1,
        linkedInRefreshToken: _2,
        facebookToken: _3,
        facebookPageId: _4,
        ...userWithoutSensitiveInfo
      } = user;

      return {
        success: true,
        user: userWithoutSensitiveInfo,
        tokens,
      };
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  // Helper method to handle social tokens
  async handleSocialTokens(user: any) {
    try {
      // Handle LinkedIn tokens
      if (
        env.LINKEDIN_ACCESS_TOKEN &&
        env.LINKEDIN_CLIENT_ID &&
        env.LINKEDIN_CLIENT_SECRET &&
        user.linkedInAccessToken === null
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            linkedInAppId: env.LINKEDIN_CLIENT_ID,
            linkedInAppSecret: env.LINKEDIN_CLIENT_SECRET,
            linkedInAccessToken: env.LINKEDIN_ACCESS_TOKEN,
            linkedInRefreshToken: env.LINKEDIN_REFRESH_TOKEN,
          },
        });
      }

      // Handle Facebook tokens
      if (env.FACEBOOK_PAGE_ACCESS_TOKEN && user.facebookToken === null) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            facebookAppId: env.FACEBOOK_APP_ID,
            facebookAppSecret: env.FACEBOOK_APP_SECRET,
            facebookToken: env.FACEBOOK_PAGE_ACCESS_TOKEN,
            facebookPageId: env.FACEBOOK_PAGE_ID,
          },
        });
      }
    } catch (error) {
      console.error("Error handling social tokens:", error);
      // Don't throw here to not block login if social token update fails
    }
  },
  async requestPasswordReset(email: string) {
    console.log("📧 PASSWORD RESET REQUEST RECEIVED");
    console.log("📧 Email to reset password for:", email);

    try {
      // Find user by email
      console.log("📧 Searching for user with email:", email);
      const user = await prisma.user.findUnique({
        where: { email },
      });

      console.log("📧 User search result:", user ? "FOUND" : "NOT FOUND");

      if (!user) {
        console.log("📧 No user found with email:", email);
        return {
          success: false,
          status: 404,
          message:
            "No account found with this email address. Please check your email or register.",
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        } as any, // Type assertion needed for custom fields
      });

      // Send email
      console.log("📧 ABOUT TO SEND PASSWORD RESET EMAIL TO:", user.email);
      console.log("📧 WITH TOKEN:", resetToken);

      try {
        const emailSent = await sendPasswordResetEmail(user.email, resetToken);
        console.log(
          "📧 Email sending result:",
          emailSent ? "SUCCESS" : "FAILED"
        );
      } catch (emailError) {
        console.error("📧 ERROR SENDING RESET EMAIL:", emailError);
        throw new Error("Failed to send password reset email");
      }

      return {
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };
    } catch (error) {
      console.error("Error in requestPasswordReset service:", error);
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      if (!token || !newPassword) {
        return {
          success: false,
          status: 400,
          message: "Token and password are required",
        };
      }

      // Find user by token and check expiration
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date(),
          },
        } as any, // Type assertion needed for custom fields
      });

      if (!user) {
        return {
          success: false,
          status: 400,
          message: "Invalid or expired reset token",
        };
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        } as any, // Type assertion needed for custom fields
      });

      // Invalidate all refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      return {
        success: true,
        message: "Password has been reset successfully",
      };
    } catch (error) {
      console.error("Error in resetPassword service:", error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          facebookToken: true,
          linkedInAccessToken: true,
          createdAt: true,
          updatedAt: true,
          organizations: {
            select: {
              id: true,
              name: true,
              website: true,
              category: true,
              location: true,
              description: true,
              established: true,
              size: true,
              employees: true,
              turnover: true,
              revenue: true,
              profit: true,
              marketArea: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          status: 404,
          message: "User not found",
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("Error in getUserById service:", error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId: number, userData: any) {
    try {
      // First, fetch the user with their organizations to get the organization ID if it exists
      const userWithOrgs = await prisma.user.findUnique({
        where: { id: userId },
        include: { organizations: true },
      });

      if (!userWithOrgs) {
        return {
          success: false,
          status: 404,
          message: "User not found",
        };
      }

      // Basic user data to update
      const updateData: any = {
        name: userData.name,
        email: userData.email,
        facebookToken: userData.facebookToken,
        linkedInAccessToken: userData.linkedInAccessToken,
      };

      // Check if user has organizations
      if (userWithOrgs.organizations && userWithOrgs.organizations.length > 0) {
        // If the user has an organization, update it
        await prisma.organization.update({
          where: { id: userWithOrgs.organizations[0].id },
          data: {
            name: userData.organization?.name,
            website: userData.organization?.website,
            category: userData.organization?.category,
            location: userData.organization?.location,
            description: userData.organization?.description,
            established: userData.organization?.established,
            size: userData.organization?.size,
            employees: userData.organization?.employees,
            revenue: userData.organization?.revenue,
            marketArea: userData.organization?.marketArea,
          },
        });
      } else if (userData.organization) {
        // If the user doesn't have an organization but provided organization data, create one
        updateData.organizations = {
          create: {
            name: userData.organization.name || "New Organization",
            website: userData.organization.website,
            category: userData.organization.category,
            location: userData.organization.location,
            description: userData.organization.description,
            established: userData.organization.established,
            size: userData.organization.size,
            employees: userData.organization.employees,
            revenue: userData.organization.revenue,
            marketArea: userData.organization.marketArea,
          },
        };
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          organizations: true,
        },
      });

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error in updateUser service:", error);
      throw error;
    }
  },
};
