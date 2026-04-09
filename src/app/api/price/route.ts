import { NextRequest, NextResponse } from "next/server";
import { fetchLivePrice, getAudUsdRate, getUsdInrRate } from "@/lib/price";
import { convertAmount } from "@/lib/currency";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";
import { getActivePortfolioId } from "@/lib/profile";
import type { Currency } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code?.trim()) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const portfolioId = await getActivePortfolioId(userId);

  const [price, portfolio] = await Promise.all([
    fetchLivePrice(code.trim()),
    portfolioId
      ? db.portfolio.findUnique({ where: { id: portfolioId }, select: { currency: true } })
      : Promise.resolve(null),
  ]);

  if (price === null) {
    return NextResponse.json({ error: "Could not fetch price" }, { status: 404 });
  }

  const portfolioCurrency = (portfolio?.currency ?? "aud") as Currency;

  // If stock's native currency differs from portfolio currency, return a converted price for display
  let convertedPrice: number | null = null;
  if (price.currency !== portfolioCurrency) {
    const [fxRate, usdInrRate] = await Promise.all([getAudUsdRate(), getUsdInrRate()]);
    convertedPrice = convertAmount(price.price, price.currency, portfolioCurrency, fxRate, usdInrRate);
  }

  return NextResponse.json({ price, convertedPrice, portfolioCurrency });
}
