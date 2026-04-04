"use client";

import type { Holding } from "@prisma/client";

function fmt(n: number) {
  return `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, "");
}

function fmtPct(n: number) {
  const v = Math.abs(n) < 1e-9 ? 0 : n;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function colorClass(n: number) {
  if (Math.abs(n) < 1e-9) return "text-muted font-bold";
  return n > 0 ? "text-good font-bold" : "text-bad font-bold";
}

interface Props {
  holdings: Holding[];
  onSell: (id: string) => void;
  selling: string | null;
}

export function HoldingsTable({ holdings, onSell, selling }: Props) {
  if (holdings.length === 0) {
    return (
      <div className="text-center text-muted py-8 text-sm">No stocks added yet.</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[14px]">
      <table className="w-full border-collapse text-sm whitespace-nowrap">
        <thead>
          <tr className="bg-[#efe6d8] text-[#56483b]">
            {[
              "Code",
              "Buy Price",
              "Current Price",
              "Qty",
              "% Change",
              "Days Held",
              "Invested",
              "Current Value",
              "P/L",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-center text-xs uppercase tracking-wider font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const currentPrice = h.currentPrice ?? h.buyPrice;
            const currentValue = currentPrice * h.quantity;
            const invested = h.buyPrice * h.quantity;
            const pl = currentValue - invested;
            const pct = h.buyPrice > 0 ? ((currentPrice - h.buyPrice) / h.buyPrice) * 100 : 0;
            const daysHeld = Math.max(
              0,
              Math.floor(
                (Date.now() - new Date(h.purchasedOn).getTime()) / (1000 * 60 * 60 * 24)
              )
            );

            return (
              <tr key={h.id} className="border-b border-line last:border-b-0 hover:bg-[#f9f5ed] transition-colors">
                <td className="px-3 py-3 text-center font-semibold text-ink">{h.code}</td>
                <td className="px-3 py-3 text-center">{fmt(h.buyPrice)}</td>
                <td className="px-3 py-3 text-center">
                  {h.currentPrice !== null ? fmt(h.currentPrice) : <span className="text-muted">N/A</span>}
                </td>
                <td className="px-3 py-3 text-center">{fmtQty(h.quantity)}</td>
                <td className={`px-3 py-3 text-center ${colorClass(pct)}`}>{fmtPct(pct)}</td>
                <td className="px-3 py-3 text-center">{daysHeld}</td>
                <td className="px-3 py-3 text-center">{fmt(invested)}</td>
                <td className="px-3 py-3 text-center">{fmt(currentValue)}</td>
                <td className={`px-3 py-3 text-center ${colorClass(pl)}`}>{fmt(pl)}</td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => onSell(h.id)}
                    disabled={selling === h.id}
                    className="rounded-[10px] bg-danger text-white text-xs font-bold px-3 py-2 hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {selling === h.id ? "Selling…" : "Sell"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
