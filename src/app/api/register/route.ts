import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { startingCashForCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const { email, password, confirmPassword, currency, profileName } = await req.json();

  if (!email?.trim() || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Enter a password." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const portfolioCurrency: Currency = currency === "usd" ? "usd" : currency === "inr" ? "inr" : "aud";
  const startingCash = startingCashForCurrency(portfolioCurrency);
  const name = profileName?.trim() || "My Portfolio";

  const user = await db.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email: normalizedEmail, passwordHash, salt },
    });

    const portfolio = await tx.portfolio.create({
      data: {
        userId: newUser.id,
        name,
        cash: startingCash,
        startingCash,
        currency: portfolioCurrency,
        currentDay: new Date(),
      },
    });

    return tx.user.update({
      where: { id: newUser.id },
      data: { activeProfileId: portfolio.id },
    });
  });

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
