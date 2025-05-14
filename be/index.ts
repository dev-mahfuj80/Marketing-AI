import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./src/config/env.js";

// Import routes
import authRoutes from "./src/routes/auth.routes.js";
import socialAuthRoutes from "./src/routes/social-auth.routes.js";
import postsRoutes from "./src/routes/posts.routes.js";

// Initialize Express app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cookieParser(env.COOKIE_SECRET));
app.use(
  cors({
    origin: [env.FRONTEND_URL, "https://marketing-ai-ws7v.vercel.app"],
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/social", socialAuthRoutes);
app.use("/api/posts", postsRoutes);

// Simple health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: env.isDevelopment() ? err.message : undefined,
    });
  }
);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
