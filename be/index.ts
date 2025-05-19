import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Debug logs for Vercel troubleshooting
console.log("Starting application...");

try {
  console.log("Importing env...");
  var { env } = await import("./src/config/env.js");
  console.log("Env imported successfully");
} catch (err) {
  console.error("Error importing env:", err);
  throw err;
}

try {
  console.log("Importing prisma...");
  var { prisma } = await import("./src/utils/prisma.js");
  console.log("Prisma imported successfully");
} catch (err) {
  console.error("Error importing prisma:", err);
  throw err;
}

// Import routes
try {
  console.log("Importing routes...");
  var authRoutes = await import("./src/routes/auth.routes.js").then(
    (m) => m.default
  );
  var socialAuthRoutes = await import(
    "./src/routes/social-auth.routes.js"
  ).then((m) => m.default);
  var postsRoutes = await import("./src/routes/posts.routes.js").then(
    (m) => m.default
  );
  var facebookRoutes = await import("./src/routes/facebook.routes.js").then(
    (m) => m.default
  );
  var linkedinRoutes = await import("./src/routes/linkedin.routes.js").then(
    (m) => m.default
  );
  console.log("Routes imported successfully");
} catch (err) {
  console.error("Error importing routes:", err);
  throw err;
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser(env.COOKIE_SECRET));
// Configure CORS with more detailed options for better debugging
app.use((req, res, next) => {
  // Log CORS debug info
  console.log(`CORS Request from origin: ${req.headers.origin}`);
  console.log(`CORS Request method: ${req.method}`);
  next();
});

app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        env.FRONTEND_URL,
        "https://marketing-ai-omega.vercel.app",
        // Local development URLs
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173", // Vite default
      ];
      
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/social", socialAuthRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/facebook", facebookRoutes);

// Simple health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Server is running...",
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "Health is good", timestamp: new Date().toISOString() });
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
