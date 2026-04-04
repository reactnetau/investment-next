import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchLivePrice } from "@/lib/price";
import { getSession, getUserId } from "@/lib/session";

function moneyToCents(value: number): number {
  return Math.round(value * 100);
}

/** POST /api/holdings — add a new stock holding */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, buyPrice, quantity, amountAud } = await req.json();

  if (!code?.trim()) {
    return NextResponse.json({ error: "Enter a stock code." }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();

  // Fetch live price (always attempt it)
  const livePrice = await fetchLivePrice(normalizedCode);

  let buyPriceNum: number;
  let usedLive = false;

  if (buyPrice) {
    buyPriceNum = parseFloat(String(buyPrice).replace(/,/g, ""));
    if (isNaN(buyPriceNum) || buyPriceNum <= 0) {
      return NextResponse.json({ error: "Buy-in price must be greater than zero." }, { status: 400 });
    }
  } else {
    if (!livePrice || livePrice <= 0) {
      return NextResponse.json(
        { error: "Could not fetch a live buy-in price. Enter one manually." },
        { status: 422 }
      );
    }
    buyPriceNum = livePrice;
    usedLive = true;
  }

  let quantityNum: number;
  if (amountAud) {
    const amount = parseFloat(String(amountAud).replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount (AUD) must be greater than zero." }, { status: 400 });
    }
    quantityNum = amount / buyPriceNum;
  } else {
    quantityNum = parseFloat(String(quantity).replace(/,/g, ""));
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than zero." }, { status: 400 });
    }
  }

  const cost = buyPriceNum * quantityNum;

  const portfolio = await db.portfolio.findUnique({ where: { userId } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  if (moneyToCents(cost) > moneyToCents(portfolio.cash)) {
    return NextResponse.json(
      { error: `Not enough cash. You have $${portfolio.cash.toFixed(2)} available.` },
      { status: 422 }
    );
  }

  const currentPrice = usedLive ? buyPriceNum : (livePrice ?? null);

  const [holding] = await db.$transaction([
    db.holding.create({
      data: {
        portfolioId: portfolio.id,
        code: normalizedCode,
        buyPrice: buyPriceNum,
        quantity: quantityNum,
        currentPrice,
        purchasedOn: new Date(),
        volatility: Math.random() * (0.05 - 0.01) + 0.01,
        momentumBias: Math.random() * (0.004 - -0.004) + -0.004,
      },
    }),
    db.portfolio.update({
      where: { id: portfolio.id },
      data: { cash: (moneyToCents(portfolio.cash) - moneyToCents(cost)) / 100 },
    }),
  ]);

  const message = usedLive
    ? `Bought ${quantityNum.toFixed(4)} shares of ${normalizedCode} at $${buyPriceNum.toFixed(2)} (live price).`
    : `Bought ${quantityNum.toFixed(4)} shares of ${normalizedCode} at $${buyPriceNum.toFixed(2)}.`;

  return NextResponse.json({ holding, message }, { status: 201 });
}
