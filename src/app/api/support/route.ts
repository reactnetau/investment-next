import { NextRequest, NextResponse } from "next/server";
import { sendSupportEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { topic, message, fromEmail, fromName } = await req.json();

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Please select a topic." }, { status: 400 });
  }
  if (!message?.trim() || message.trim().length < 10) {
    return NextResponse.json({ error: "Please describe your issue (at least 10 characters)." }, { status: 400 });
  }
  if (!fromEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail.trim())) {
    return NextResponse.json({ error: "Enter a valid email address so we can reply." }, { status: 400 });
  }

  try {
    await sendSupportEmail({
      topic: topic.trim(),
      message: message.trim(),
      fromEmail: fromEmail.trim().toLowerCase(),
      fromName: fromName?.trim() || undefined,
    });
  } catch (e) {
    console.error("Support email failed:", e);
    return NextResponse.json({ error: "Failed to send your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
