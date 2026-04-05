import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";
import { getAudUsdRate } from "@/lib/price";
import { convertAmount } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

function moneyToCents(value: number): number {
  return Math.round(value * 100);
}

/** DELETE /api/holdings/[id] — sell (remove) a holding */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const holding = await db.holding.findUnique({ where: { id } });
  if (!holding) return NextResponse.json({ error: "Holding not found" }, { status: 404 });

  const portfolio = await db.portfolio.findUnique({ where: { userId } });
  if (!portfolio || portfolio.id !== holding.portfolioId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const priceCurrency = (holding.priceCurrency ?? "aud") as Currency;
  const portfolioCurrency = (portfolio.currency ?? "aud") as Currency;
  const fxRate = await getAudUsdRate();

  const nativeSalePrice = holding.currentPrice !== null ? holding.currentPrice : holding.buyPrice;
  const nativeSaleValue = nativeSalePrice * holding.quantity;
  const nativeCost = holding.buyPrice * holding.quantity;

  // Convert to portfolio currency for cash and P/L
  const saleValue = convertAmount(nativeSaleValue, priceCurrency, portfolioCurrency, fxRate);
  const costInPortfolioCurrency = convertAmount(nativeCost, priceCurrency, portfolioCurrency, fxRate);
  const profit = saleValue - costInPortfolioCurrency;

  await db.$transaction([
    db.holding.delete({ where: { id } }),
    db.portfolio.update({
      where: { id: portfolio.id },
      data: { cash: (moneyToCents(portfolio.cash) + moneyToCents(saleValue)) / 100 },
    }),
  ]);

  const cur = portfolioCurrency.toUpperCase();
  const message = `Sold ${holding.code} for ${cur} ${saleValue.toFixed(2)}. Realized P/L: ${profit >= 0 ? "+" : ""}${cur} ${profit.toFixed(2)}.`;
  return NextResponse.json({ message });
}
