"use client";

import type { Holding } from "@prisma/client";

function fmt(n: number) {
  return `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, "");
}

function colorClass(n: number) {
  if (Math.abs(n) < 1e-9) return "text-muted font-semibold";
  return n > 0 ? "text-good font-semibold" : "text-bad font-semibold";
}

interface Props {
  holding: Holding;
  onConfirm: () => void;
  onClose: () => void;
  selling: boolean;
}

export function SellModal({ holding, onConfirm, onClose, selling }: Props) {
  const currentPrice = holding.currentPrice ?? holding.buyPrice;
  const saleValue = currentPrice * holding.quantity;
  const invested = holding.buyPrice * holding.quantity;
  const pl = saleValue - invested;
  const pct = holding.buyPrice > 0 ? ((currentPrice - holding.buyPrice) / holding.buyPrice) * 100 : 0;
  const daysHeld = Math.max(
    0,
    Math.floor((Date.now() - new Date(holding.purchasedOn).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={selling ? undefined : onClose} />

      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <h2 className="text-lg font-bold text-ink mb-1">Sell {holding.code}</h2>
        <p className="text-sm text-muted mb-5">Review your trade before confirming.</p>

        <div className="rounded-xl border border-line bg-[#faf7f2] divide-y divide-line text-sm mb-5">
          <Row label="Quantity" value={fmtQty(holding.quantity)} />
          <Row label="Buy Price" value={fmt(holding.buyPrice)} />
          <Row
            label="Current Price"
            value={holding.currentPrice !== null ? fmt(holding.currentPrice) : `${fmt(holding.buyPrice)} (no live price)`}
          />
          <Row label="Days Held" value={String(daysHeld)} />
          <Row label="Amount Invested" value={fmt(invested)} />
          <Row label="Sale Value" value={fmt(saleValue)} />
          <Row
            label="P/L"
            value={`${pl >= 0 ? "+" : ""}${fmt(pl)}`}
            valueClass={colorClass(pl)}
          />
          <Row
            label="Return"
            value={`${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
            valueClass={colorClass(pct)}
          />
        </div>

        <p className="text-xs text-muted mb-5">
          {fmt(saleValue)} will be added back to your cash balance.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={selling}
            className="flex-1 rounded-xl border border-line bg-white py-3 text-ink font-bold text-base hover:bg-[#f0ece3] disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={selling}
            className="flex-1 rounded-xl bg-danger py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
          >
            {selling ? "Selling…" : "Confirm Sell"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-ink font-semibold",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-muted">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
