/**
 * Environment variable configuration with validation
 */
export const env = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database - handled by Prisma
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'development-jwt-secret',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'development-cookie-secret',
  
  // OAuth
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || '',
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || '',
  REDIRECT_URI: process.env.REDIRECT_URI || 'http://localhost:3001/api/auth/callback',
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.example.com',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_SECURE: process.env.SMTP_SECURE || 'false',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@example.com',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Validation
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
};

// Validate required environment variables in production
if (env.isProduction()) {
  const requiredEnvVars = [
    'JWT_SECRET',
    'COOKIE_SECRET',
    'DATABASE_URL',
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
