"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@prisma/client";
import { formatMoney, convertAmount } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

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

function timeAgo(date: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type HoldingWithAge = Holding & { priceUpdatedAt: string | null; priceCurrency?: string };

interface Props {
  holdings: HoldingWithAge[];
  onSell: (holding: Holding) => void;
  selling: string | null;
  currency: Currency;
  fxRate: number;
}

export function HoldingsTable({ holdings, onSell, selling, currency, fxRate }: Props) {
  const fmt = (n: number) => formatMoney(n, currency);

  // Tick every 30s so timeAgo labels stay current after a price refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

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
            {["Code", "Market", "Buy Price", "Current Price", "Qty", "% Change", "Days Held", "Invested", "Current Value", "P/L", "Action"].map((h) => (
              <th key={h} className="px-3 py-3 text-center text-xs uppercase tracking-wider font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const pc = (h.priceCurrency ?? "aud") as Currency;
            const nativePrice = h.currentPrice ?? h.buyPrice;
            const nativeBuy = h.buyPrice;

            // Convert to display currency
            const displayPrice = convertAmount(nativePrice, pc, currency, fxRate);
            const displayBuy = convertAmount(nativeBuy, pc, currency, fxRate);
            const currentValue = displayPrice * h.quantity;
            const invested = displayBuy * h.quantity;
            const pl = currentValue - invested;
            const pct = displayBuy > 0 ? ((displayPrice - displayBuy) / displayBuy) * 100 : 0;
            const daysHeld = Math.max(0, Math.floor((Date.now() - new Date(h.purchasedOn).getTime()) / (1000 * 60 * 60 * 24)));

            return (
              <tr key={h.id} className="border-b border-line last:border-b-0 hover:bg-[#f9f5ed] transition-colors">
                <td className="px-3 py-3 text-center">
                  <div className="font-semibold text-ink">{h.code}</div>
                </td>
                <td className="px-3 py-3 text-center text-muted">
                  {pc === "aud" ? "ASX" : "NASDAQ"}
                </td>
                <td className="px-3 py-3 text-center">{fmt(displayBuy)}</td>
                <td className="px-3 py-3 text-center">
                  {h.currentPrice !== null ? (
                    <div>
                      <div>{fmt(displayPrice)}</div>
                      {h.priceUpdatedAt && (
                        <div className="text-[10px] text-muted font-normal">{timeAgo(h.priceUpdatedAt)}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">{fmtQty(h.quantity)}</td>
                <td className={`px-3 py-3 text-center ${colorClass(pct)}`}>{fmtPct(pct)}</td>
                <td className="px-3 py-3 text-center">{daysHeld}</td>
                <td className="px-3 py-3 text-center">{fmt(invested)}</td>
                <td className="px-3 py-3 text-center">{fmt(currentValue)}</td>
                <td className={`px-3 py-3 text-center ${colorClass(pl)}`}>{fmt(pl)}</td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => onSell(h)}
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
