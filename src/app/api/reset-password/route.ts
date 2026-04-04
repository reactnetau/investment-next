import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password, confirmPassword } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Invalid or missing reset token." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Enter a new password." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash, salt, resetToken: null, resetTokenExpiry: null },
  });

  return NextResponse.json({ ok: true });
}
