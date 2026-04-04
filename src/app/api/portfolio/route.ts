import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchLivePrice } from "@/lib/price";
import { getSession, getUserId } from "@/lib/session";

/** GET /api/portfolio — fetch current portfolio for the signed-in user */
export async function GET() {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await db.portfolio.upsert({
    where: { userId },
    create: { userId, cash: 10000, startingCash: 10000, currentDay: new Date() },
    update: {},
    include: { holdings: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(portfolio);
}

/** PATCH /api/portfolio — reset portfolio */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();

  if (action === "reset") {
    const portfolio = await db.portfolio.update({
      where: { userId },
      data: {
        cash: 10000,
        startingCash: 10000,
        currentDay: new Date(),
        holdings: { deleteMany: {} },
      },
      include: { holdings: true },
    });
    return NextResponse.json(portfolio);
  }

  if (action === "refresh_prices") {
    const portfolio = await db.portfolio.findUnique({
      where: { userId },
      include: { holdings: true },
    });
    if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Promise.all(
      portfolio.holdings.map(async (h) => {
        const price = await fetchLivePrice(h.code);
        if (price !== null && price > 0) {
          await db.holding.update({
            where: { id: h.id },
            data: { currentPrice: price },
          });
        }
      })
    );

    const updated = await db.portfolio.findUnique({
      where: { userId },
      include: { holdings: { orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
