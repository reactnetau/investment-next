import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAudUsdRate, fetchLivePrice } from "@/lib/price";
import { stripe } from "@/lib/stripe";
import { getSession, getUserId } from "@/lib/session";
import { getActivePortfolioId } from "@/lib/profile";

function getNextDailyUtcRefresh(hourUtc: number, minuteUtc = 0): Date {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(hourUtc, minuteUtc, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  return next;
}

/** GET /api/portfolio — fetch active portfolio for the signed-in user */
export async function GET() {
  try {
    const session = await getSession();
    const userId = getUserId(session);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCustomerId: true },
    });

    let portfolioId = await getActivePortfolioId(userId);

    let portfolio;
    if (portfolioId) {
      portfolio = await db.portfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: { orderBy: { createdAt: "asc" } } },
      });
    }

    // No portfolio exists at all — create a default one
    if (!portfolio) {
      portfolio = await db.portfolio.create({
        data: { userId, name: "My Portfolio", cash: 10000, startingCash: 10000, currentDay: new Date() },
        include: { holdings: { orderBy: { createdAt: "asc" } } },
      });
      await db.user.update({ where: { id: userId }, data: { activeProfileId: portfolio.id } });
      portfolioId = portfolio.id;
    }

    // If the user has a Stripe customer but plan isn't pro, check Stripe directly for a completed payment
    if (user?.stripeCustomerId && user.plan !== "pro") {
      try {
        const sessions = await stripe.checkout.sessions.list({
          customer: user.stripeCustomerId,
          limit: 10,
        });
        const paid = sessions.data.some((s) => s.payment_status === "paid");
        if (paid) {
          await db.user.update({ where: { id: userId }, data: { plan: "pro" } });
          if (user) user.plan = "pro";
        }
      } catch {
        // If Stripe check fails, fall through with the existing plan value
      }
    }

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

    // Match the Railway cron schedule: 0 7 * * * (7:00 UTC daily).
    const nextPriceRefresh = prices.length > 0 ? getNextDailyUtcRefresh(7, 0) : null;

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

/** PATCH /api/portfolio — reset portfolio or refresh prices */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolioId = await getActivePortfolioId(userId);
  if (!portfolioId) return NextResponse.json({ error: "No portfolio found" }, { status: 404 });

  const { action } = await req.json();

  if (action === "reset") {
    const portfolio = await db.portfolio.update({
      where: { id: portfolioId },
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
    try {
      const portfolio = await db.portfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
      });
      if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });

      await Promise.all(
        portfolio.holdings.map(async (h) => {
          try {
            const result = await fetchLivePrice(h.code);
            if (result !== null && result.price > 0) {
              await Promise.all([
                db.price.upsert({
                  where: { code: h.code },
                  update: { price: result.price, currency: result.currency },
                  create: { code: h.code, price: result.price, currency: result.currency },
                }),
                db.holding.update({
                  where: { id: h.id },
                  data: { currentPrice: result.price, priceCurrency: result.currency },
                }),
              ]);
            }
          } catch {
            // Skip this holding if it fails — don't let one failure abort the rest
          }
        })
      );

      // Return full enriched response (same shape as GET)
      const [updated, user, fxRate] = await Promise.all([
        db.portfolio.findUnique({ where: { id: portfolioId }, include: { holdings: { orderBy: { createdAt: "asc" } } } }),
        db.user.findUnique({ where: { id: userId }, select: { plan: true } }),
        getAudUsdRate(),
      ]);
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const codes = [...new Set(updated.holdings.map((h) => h.code))];
      const prices = await db.price.findMany({ where: { code: { in: codes } } });
      const priceMap = Object.fromEntries(prices.map((p) => [p.code, p.updatedAt]));
      const holdingsWithAge = updated.holdings.map((h) => ({ ...h, priceUpdatedAt: priceMap[h.code] ?? null }));

      const nextPriceRefresh = prices.length > 0 ? getNextDailyUtcRefresh(7, 0) : null;

      return NextResponse.json({
        ...updated,
        holdings: holdingsWithAge,
        plan: user?.plan ?? "free",
        currency: updated.currency ?? "aud",
        fxRate,
        nextPriceRefresh,
      });
    } catch (e) {
      console.error("refresh_prices error:", e);
      return NextResponse.json({ error: "Failed to refresh prices. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
