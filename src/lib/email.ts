import { getAppUrl } from "@/lib/app-url";

const APP_URL = getAppUrl();
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
  if (!res.ok) throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  return data.access_token;
}

function buildRawEmail(to: string, subject: string, html: string): string {
  const encodedBody = Buffer.from(html, "utf-8").toString("base64");

  const message = [
    `From: ${FROM}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const accessToken = await getAccessToken();
  const raw = buildRawEmail(to, subject, html);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Gmail API error: ${JSON.stringify(data)}`);
  }
}

export async function sendNewProSubscriberEmail(customerEmail: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendEmail(
    adminEmail,
    "New Pro subscriber - Investment Simulator",
    `<p>Someone just upgraded to Pro!</p><p><strong>Email:</strong> ${customerEmail}</p>`
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await sendEmail(
    email,
    "Reset your password - Investment Simulator",
    `
      <p>You requested a password reset for your Investment Simulator account.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#d8a23d;color:#2e2416;font-weight:bold;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
      </p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `
  );
}
