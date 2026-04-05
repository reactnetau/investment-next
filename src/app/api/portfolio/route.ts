import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedPrice, getAudUsdRate } from "@/lib/price";
import { getSession, getUserId } from "@/lib/session";

/** GET /api/portfolio — fetch current portfolio for the signed-in user */
export async function GET() {
  try {
    const session = await getSession();
    const userId = getUserId(session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [portfolio, user] = await Promise.all([
      db.portfolio.upsert({
        where: { userId },
        create: { userId, cash: 10000, startingCash: 10000, currentDay: new Date() },
        update: {},
        include: { holdings: { orderBy: { createdAt: "asc" } } },
      }),
      db.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    ]);

    // Attach price cache timestamps and FX rate
    const codes = [...new Set(portfolio.holdings.map((h) => h.code))];
    const [prices, fxRate] = await Promise.all([
      db.price.findMany({ where: { code: { in: codes } } }),
      getAudUsdRate(),
    ]);
    const priceMap = Object.fromEntries(prices.map((p) => [p.code, p.updatedAt]));

    const holdingsWithAge = portfolio.holdings.map((h) => ({
      ...h,
      priceUpdatedAt: priceMap[h.code] ?? null,
    }));

    // Next refresh = most recent cache update + 2 hours
    const mostRecentUpdate = prices.reduce<Date | null>((latest, p) => {
      return !latest || p.updatedAt > latest ? p.updatedAt : latest;
    }, null);
    const nextPriceRefresh = mostRecentUpdate
      ? new Date(mostRecentUpdate.getTime() + 2 * 60 * 60 * 1000)
      : null;

    return NextResponse.json({
      ...portfolio,
      holdings: holdingsWithAge,
      plan: user?.plan ?? "free",
      currency: portfolio.currency ?? "aud",
      fxRate,
      nextPriceRefresh,
    });
  } catch (e) {
    console.error("GET /api/portfolio error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
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
        const result = await getCachedPrice(h.code);
        if (result !== null && result.price > 0) {
          await db.holding.update({
            where: { id: h.id },
            data: { currentPrice: result.price, priceCurrency: result.currency },
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
