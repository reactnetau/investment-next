import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Always return success to avoid leaking whether email exists
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  // TODO: remove debug error detail before launch
  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("Failed to send reset email:", detail);
    return NextResponse.json({ error: `Email failed: ${detail}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
