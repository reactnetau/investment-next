import nodemailer from "nodemailer";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.EMAIL_FROM ?? "Investment Simulator <noreply@investorsplayground.com>";

export async function sendNewProSubscriberEmail(customerEmail: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const transporter = createTransport();
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

  const transporter = createTransport();
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
