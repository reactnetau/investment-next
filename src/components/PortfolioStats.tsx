"use client";

import type { Portfolio, Holding } from "@prisma/client";

type PortfolioWithHoldings = Portfolio & { holdings: Holding[] };

function fmt(n: number) {
  return `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
  sub?: string;
}

function StatCard({ label, value, valueClass = "text-ink", sub }: StatCardProps) {
  return (
    <div
      className="rounded-[18px] border border-line bg-panel p-4"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="text-muted text-xs uppercase tracking-widest font-medium">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</div>
      {sub && <div className="mt-2 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function PortfolioStats({ portfolio }: { portfolio: PortfolioWithHoldings }) {
  const totalInvested = portfolio.holdings.reduce((s, h) => s + h.buyPrice * h.quantity, 0);
  const totalValue = portfolio.holdings.reduce(
    (s, h) => s + (h.currentPrice ?? h.buyPrice) * h.quantity,
    0
  );
  const totalProfit = totalValue - totalInvested;
  const totalPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const portfolioTotal = portfolio.cash + totalValue;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <StatCard label="Cash" value={fmt(portfolio.cash)} />
      <StatCard label="Portfolio Total" value={fmt(portfolioTotal)} />
      <StatCard
        label="All Stocks Change"
        value={fmt(totalProfit)}
        valueClass={colorClass(totalProfit)}
      />
      <StatCard
        label="All Stocks %"
        value={fmtPct(totalPct)}
        valueClass={colorClass(totalPct)}
      />
    </div>
  );
}
