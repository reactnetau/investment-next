import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";

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

  const saleValue =
    holding.currentPrice !== null
      ? holding.currentPrice * holding.quantity
      : holding.buyPrice * holding.quantity;

  const profit = saleValue - holding.buyPrice * holding.quantity;

  await db.$transaction([
    db.holding.delete({ where: { id } }),
    db.portfolio.update({
      where: { id: portfolio.id },
      data: { cash: (moneyToCents(portfolio.cash) + moneyToCents(saleValue)) / 100 },
    }),
  ]);

  const message = `Sold ${holding.code} for $${saleValue.toFixed(2)}. Realized P/L: ${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}.`;
  return NextResponse.json({ message });
}
