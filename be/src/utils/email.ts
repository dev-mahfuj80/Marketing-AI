import nodemailer from "nodemailer";
import { env } from "../config/env";

// Check if we're in development mode to use a test account
const isDev = env.NODE_ENV === "development" || env.NODE_ENV === "test";

// Configure email transporter
let transporter: nodemailer.Transporter;

// Check if SMTP credentials are provided
const hasSmtpCredentials = env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_HOST;

if (!hasSmtpCredentials) {
  console.log("⚠️ NO SMTP CREDENTIALS FOUND - emails will not be sent");
  console.log("⚠️ To send actual emails, configure SMTP settings in your .env file");

  // Create a mock transporter that just logs emails
  transporter = {
    sendMail: async (mailOptions: any) => {
      console.log("\n====== MOCK EMAIL SENT ======");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log(
        "Reset URL extracted from email:",
        mailOptions.html.match(/href="([^"]+)"/)?.[1] || "URL not found"
      );
      console.log("Email Content:", mailOptions.html);
      console.log("==============================\n");
      return { messageId: "mock-email-id" };
    },
  } as any;
} else {
  console.log("📧 Setting up real email transporter with:");
  console.log(`- Host: ${env.SMTP_HOST}`);
  console.log(`- Port: ${env.SMTP_PORT}`);
  console.log(`- User: ${env.SMTP_USER}`);
  console.log(`- Secure: ${env.SMTP_SECURE}`);

  // Use real email transporter with provided credentials
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || "587"),
    secure: env.SMTP_SECURE === "true",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Marketing AI" <${env.SMTP_FROM || env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <p style="margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    // Add text version for better deliverability
    text: `Reset Your Password\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
  };

  try {
    console.log(`🔄 Attempting to send password reset email to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    return false;
  }
};
