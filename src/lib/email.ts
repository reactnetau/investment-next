import nodemailer from "nodemailer";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const FROM = `Investment Simulator <${process.env.GMAIL_USER}>`;

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID ?? "",
      client_secret: process.env.GMAIL_CLIENT_SECRET ?? "",
      refresh_token: process.env.GMAIL_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(8000),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function createTransport() {
  const accessToken = await getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken,
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
