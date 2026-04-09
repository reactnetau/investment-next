import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";
import { FREE_PROFILE_LIMIT } from "@/lib/plans";
import { startingCashForCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

/** GET /api/profiles — list all profiles for the signed-in user */
export async function GET() {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, portfolios] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { activeProfileId: true, plan: true } }),
    db.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { holdings: true } } },
    }),
  ]);

  const profiles = portfolios.map((p) => ({
    id: p.id,
    name: p.name,
    cash: p.cash,
    startingCash: p.startingCash,
    currency: p.currency,
    holdingCount: p._count.holdings,
    isActive: p.id === user?.activeProfileId,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({ profiles, plan: user?.plan ?? "free" });
}

/** POST /api/profiles — create a new profile */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, currency } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Enter a profile name." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  // Enforce free tier profile limit
  if (user?.plan === "free") {
    const count = await db.portfolio.count({ where: { userId } });
    if (count >= FREE_PROFILE_LIMIT) {
      return NextResponse.json(
        { error: "Free accounts are limited to 1 portfolio. Upgrade to Pro to create multiple portfolios.", upgrade: true },
        { status: 403 }
      );
    }
  }

  const portfolioCurrency: Currency = currency === "usd" ? "usd" : currency === "inr" ? "inr" : "aud";
  const startingCash = startingCashForCurrency(portfolioCurrency);

  const portfolio = await db.portfolio.create({
    data: {
      userId,
      name: name.trim(),
      cash: startingCash,
      startingCash,
      currency: portfolioCurrency,
      currentDay: new Date(),
    },
  });

  return NextResponse.json({ profile: portfolio }, { status: 201 });
}
