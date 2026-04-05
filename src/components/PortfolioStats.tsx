"use client";

import type { Portfolio, Holding } from "@prisma/client";
import { formatMoney, convertAmount } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

type HoldingWithCurrency = Holding & { priceCurrency?: string };
type PortfolioWithHoldings = Portfolio & { holdings: HoldingWithCurrency[]; currency?: string };

function fmtPct(n: number) {
  const v = Math.abs(n) < 1e-9 ? 0 : n;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function colorClass(n: number | null | undefined) {
  if (n == null || Math.abs(n) < 1e-9) return "text-muted";
  return n > 0 ? "text-good font-bold" : "text-bad font-bold";
}

interface StatCardProps {
  label: string;
  value: string;
  valueClass?: string;
}

function StatCard({ label, value, valueClass = "text-ink" }: StatCardProps) {
  return (
    <div
      className="rounded-[18px] border border-line bg-panel p-4"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="text-muted text-xs uppercase tracking-widest font-medium">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

interface Props {
  portfolio: PortfolioWithHoldings;
  currency: Currency;
  fxRate: number;
}

export function PortfolioStats({ portfolio, currency, fxRate }: Props) {
  const fmt = (n: number) => formatMoney(n, currency);

  const totalInvested = portfolio.holdings.reduce((s, h) => {
    const pc = (h.priceCurrency ?? "aud") as Currency;
    return s + convertAmount(h.buyPrice * h.quantity, pc, currency, fxRate);
  }, 0);

  const totalValue = portfolio.holdings.reduce((s, h) => {
    const pc = (h.priceCurrency ?? "aud") as Currency;
    const price = h.currentPrice ?? h.buyPrice;
    return s + convertAmount(price * h.quantity, pc, currency, fxRate);
  }, 0);

  const totalProfit = totalValue - totalInvested;
  const totalPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const portfolioTotal = portfolio.cash + totalValue;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <StatCard label="Cash" value={fmt(portfolio.cash)} />
      <StatCard label="Portfolio Total" value={fmt(portfolioTotal)} />
      <StatCard label="All Stocks Change" value={fmt(totalProfit)} valueClass={colorClass(totalProfit)} />
      <StatCard label="All Stocks %" value={fmtPct(totalPct)} valueClass={colorClass(totalPct)} />
    </div>
  );
}
