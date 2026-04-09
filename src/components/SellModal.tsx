"use client";

import type { Holding } from "@prisma/client";
import { formatMoney, convertAmount } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

function fmtQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, "");
}

function colorClass(n: number) {
  if (Math.abs(n) < 1e-9) return "text-muted font-semibold";
  return n > 0 ? "text-good font-semibold" : "text-bad font-semibold";
}

type HoldingWithCurrency = Holding & { priceCurrency?: string };

interface Props {
  holding: HoldingWithCurrency;
  onConfirm: () => void;
  onClose: () => void;
  selling: boolean;
  currency: Currency;
  fxRate: number;
  usdInrRate: number;
}

export function SellModal({ holding, onConfirm, onClose, selling, currency, fxRate, usdInrRate }: Props) {
  const fmt = (n: number) => formatMoney(n, currency);
  const pc = (holding.priceCurrency ?? "aud") as Currency;

  const nativePrice = holding.currentPrice ?? holding.buyPrice;
  const displayPrice = convertAmount(nativePrice, pc, currency, fxRate, usdInrRate);
  const displayBuy = convertAmount(holding.buyPrice, pc, currency, fxRate, usdInrRate);

  const saleValue = displayPrice * holding.quantity;
  const invested = displayBuy * holding.quantity;
  const pl = saleValue - invested;
  const pct = displayBuy > 0 ? ((displayPrice - displayBuy) / displayBuy) * 100 : 0;
  const daysHeld = Math.max(
    0,
    Math.floor((Date.now() - new Date(holding.purchasedOn).getTime()) / (1000 * 60 * 60 * 24))
  );

  const showNativeCurrency = pc !== currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={selling ? undefined : onClose} />

      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <h2 className="text-lg font-bold text-ink mb-1">Sell {holding.code}</h2>
        <p className="text-sm text-muted mb-5">
          Review your trade before confirming.
          {showNativeCurrency && (
            <span className="ml-1">Prices converted from {pc.toUpperCase()} to {currency.toUpperCase()}.</span>
          )}
        </p>

        <div className="rounded-xl border border-line bg-[#faf7f2] divide-y divide-line text-sm mb-5">
          <Row label="Quantity" value={fmtQty(holding.quantity)} />
          <Row label="Buy Price" value={fmt(displayBuy)} />
          <Row
            label="Current Price"
            value={holding.currentPrice !== null ? fmt(displayPrice) : `${fmt(displayBuy)} (no live price)`}
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
