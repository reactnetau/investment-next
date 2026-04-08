import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, string> = {};

  // Test 1: send email
  try {
    const { sendPasswordResetEmail } = await import("@/lib/email");
    await Promise.race([
      sendPasswordResetEmail(process.env.ADMIN_EMAIL ?? "", "test-token"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out after 10s — Gmail SMTP port likely blocked")), 10000)),
    ]);
    results.email = "sent ok";
  } catch (e) {
    results.email = String(e);
  }

  return NextResponse.json(results);
}
