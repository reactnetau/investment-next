import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchLivePrice, getAudUsdRate } from "@/lib/price";
import { convertAmount } from "@/lib/currency";
import { getSession, getUserId } from "@/lib/session";
import { FREE_HOLDING_LIMIT } from "@/lib/plans";

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

  // Always fetch live price from Yahoo (native currency)
  const priceResult = await fetchLivePrice(normalizedCode);
  const livePrice = priceResult?.price ?? null;
  const priceCurrency = priceResult?.currency ?? "aud";

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

  const portfolio = await db.portfolio.findUnique({
    where: { userId },
    include: { _count: { select: { holdings: true } } },
  });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const portfolioCurrency = portfolio.currency as "aud" | "usd";

  // Enforce free tier holding limit
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
  if (user?.plan === "free" && portfolio._count.holdings >= FREE_HOLDING_LIMIT) {
    return NextResponse.json(
      { error: "Free accounts are limited to 5 stocks. Unlock unlimited with a one-off payment.", upgrade: true },
      { status: 403 }
    );
  }

  if (amountAud) {
    // amountAud is entered in portfolio currency
    const amount = parseFloat(String(amountAud).replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }
    // Convert amount to native currency to calculate quantity
    const fxRate = await getAudUsdRate();
    const amountInNative = convertAmount(amount, portfolioCurrency, priceCurrency, fxRate);
    quantityNum = amountInNative / buyPriceNum;
  } else {
    quantityNum = parseFloat(String(quantity).replace(/,/g, ""));
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than zero." }, { status: 400 });
    }
  }

  // Cost in native currency → convert to portfolio currency for cash deduction
  const costNative = buyPriceNum * quantityNum;
  const fxRate = await getAudUsdRate();
  const costInPortfolioCurrency = convertAmount(costNative, priceCurrency, portfolioCurrency, fxRate);

  if (moneyToCents(costInPortfolioCurrency) > moneyToCents(portfolio.cash)) {
    return NextResponse.json(
      { error: `Not enough cash. You have ${portfolioCurrency.toUpperCase()} ${portfolio.cash.toFixed(2)} available.` },
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
        priceCurrency,
        purchasedOn: new Date(),
        volatility: Math.random() * (0.05 - 0.01) + 0.01,
        momentumBias: Math.random() * (0.004 - -0.004) + -0.004,
      },
    }),
    db.portfolio.update({
      where: { id: portfolio.id },
      data: { cash: (moneyToCents(portfolio.cash) - moneyToCents(costInPortfolioCurrency)) / 100 },
    }),
  ]);

  const currencyLabel = priceCurrency.toUpperCase();
  const message = usedLive
    ? `Bought ${quantityNum.toFixed(4)} shares of ${normalizedCode} at ${currencyLabel} ${buyPriceNum.toFixed(2)} (live price).`
    : `Bought ${quantityNum.toFixed(4)} shares of ${normalizedCode} at ${currencyLabel} ${buyPriceNum.toFixed(2)}.`;

  return NextResponse.json({ holding, message }, { status: 201 });
}
