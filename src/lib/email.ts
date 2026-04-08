import nodemailer from "nodemailer";
import { google } from "googleapis";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const FROM = `Investment Simulator <${process.env.GMAIL_USER}>`;

async function createTransport() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const tokenResponse = await Promise.race([
    oauth2Client.getAccessToken(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Gmail OAuth timed out — check GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN")), 8000)),
  ]) as { token: string };
  const accessToken = tokenResponse.token;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken as string,
    },
  });
}

export async function sendNewProSubscriberEmail(customerEmail: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const transporter = await createTransport();
  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject: "New Pro subscriber — Investment Simulator",
    html: `
      <p>Someone just upgraded to Pro!</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const transporter = await createTransport();
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your password — Investment Simulator",
    html: `
      <p>You requested a password reset for your Investment Simulator account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}
