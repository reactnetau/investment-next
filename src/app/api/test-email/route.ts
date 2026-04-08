import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, string> = {};

  // Test 1: basic internet
  try {
    const res = await fetch("https://httpbin.org/get", { signal: AbortSignal.timeout(5000) });
    results.internet = res.ok ? "ok" : `status ${res.status}`;
  } catch (e) {
    results.internet = String(e);
  }

  // Test 2: Google OAuth endpoint
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    results.google_oauth = `reachable (status ${res.status})`;
  } catch (e) {
    results.google_oauth = String(e);
  }

  // Test 3: env vars present
  results.env = JSON.stringify({
    GMAIL_USER: !!process.env.GMAIL_USER,
    GMAIL_CLIENT_ID: !!process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: !!process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN: !!process.env.GMAIL_REFRESH_TOKEN,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
  });

  return NextResponse.json(results);
}
