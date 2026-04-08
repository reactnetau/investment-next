import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendPasswordResetEmail(
      process.env.ADMIN_EMAIL ?? process.env.GMAIL_USER ?? "",
      "test-token-123"
    );
    return NextResponse.json({ ok: true, message: `Test email sent to ${process.env.ADMIN_EMAIL ?? process.env.GMAIL_USER}` });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
