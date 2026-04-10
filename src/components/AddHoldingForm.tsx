"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";

interface Props {
  onAdded: () => void;
  onUpgradeRequired: () => void;
}

type Market = "ASX" | "NASDAQ" | "NSE" | "BSE";

const MARKET_OPTIONS: { value: Market; label: string; placeholder: string }[] = [
  { value: "ASX",    label: "ASX (Australia)",   placeholder: "BHP, CBA, WES" },
  { value: "NASDAQ", label: "NASDAQ / NYSE (US)", placeholder: "AAPL, MSFT, TSLA" },
  { value: "NSE",    label: "NSE (India)",        placeholder: "RELIANCE, TCS" },
  { value: "BSE",    label: "BSE (India)",        placeholder: "RELIANCE, TCS" },
];

function normalizeCodeForMarket(rawCode: string, market: Market): string {
  const s = rawCode.trim().toUpperCase();
  // Already has an exchange suffix — use as-is
  if (s.includes(".")) return s;
  if (market === "ASX") return `${s}.AX`;
  if (market === "NSE") return `${s}.NS`;
  if (market === "BSE") return `${s}.BO`;
  return s; // NASDAQ/NYSE — bare code
}

export function AddHoldingForm({ onAdded, onUpgradeRequired }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [market, setMarket] = useState<Market>("ASX");
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amountAud, setAmountAud] = useState("");
  const [buyPriceCurrency, setBuyPriceCurrency] = useState<string>("");
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [adding, setAdding] = useState(false);

  const selectedMarket = MARKET_OPTIONS.find((m) => m.value === market)!;

  async function fetchPrice() {
    if (!code.trim()) {
      enqueueSnackbar("Enter a stock code before fetching a live price.", { variant: "warning" });
      return;
    }
    const normalizedCode = normalizeCodeForMarket(code, market);
    setFetchingPrice(true);
    enqueueSnackbar(`Fetching live price for ${normalizedCode}…`, { variant: "info" });

    try {
      const res = await fetch(`/api/price?code=${encodeURIComponent(normalizedCode)}`);
      const data = await res.json();
      if (!res.ok) {
        enqueueSnackbar(data?.error || `Could not fetch a live price for ${normalizedCode} right now.`, { variant: "error" });
        return;
      }
      const priceObj = data.price;
      const livePrice = priceObj?.price;
      const nativeCurrency: string = priceObj?.currency || "";
      if (typeof livePrice !== "number" || isNaN(livePrice) || !isFinite(livePrice)) {
        enqueueSnackbar(`Could not fetch a valid price for ${normalizedCode}.`, { variant: "error" });
        return;
      }
      const convertedPrice: number | null = data.convertedPrice ?? null;
      const portfolioCurrency: string = data.portfolioCurrency || nativeCurrency;
      const displayPrice = convertedPrice !== null ? convertedPrice : livePrice;
      const displayCurrency = convertedPrice !== null ? portfolioCurrency : nativeCurrency;
      const formatted = parseFloat(displayPrice.toFixed(4)).toString().replace(/\.?0+$/, "");
      setBuyPrice(formatted);
      setBuyPriceCurrency(displayCurrency);
      enqueueSnackbar(`Fetched live price for ${normalizedCode}: ${displayCurrency.toUpperCase()} $${displayPrice.toFixed(2)}`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Error fetching price: ${err instanceof Error ? err.message : String(err)}`, { variant: "error" });
    } finally {
      setFetchingPrice(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);

    const normalizedCode = normalizeCodeForMarket(code, market);

    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: normalizedCode,
        buyPrice: buyPrice || undefined,
        buyPriceCurrency: buyPriceCurrency || undefined,
        quantity: quantity || undefined,
        amountAud: amountAud || undefined,
      }),
    });

    setAdding(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.upgrade) {
        onUpgradeRequired();
        return;
      }
      enqueueSnackbar(data.error ?? "Failed to add stock.", { variant: "error" });
      return;
    }

    const data = await res.json();
    enqueueSnackbar(data.message, { variant: "success" });
    setCode("");
    setBuyPrice("");
    setBuyPriceCurrency("");
    setQuantity("");
    setAmountAud("");
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Market selector */}
      <label className="flex flex-col gap-1 text-sm text-muted">
        Market
        <select
          className="theme-input bg-white"
          value={market}
          onChange={(e) => {
            setMarket(e.target.value as Market);
            setCode("");
            setBuyPrice("");
            setBuyPriceCurrency("");
          }}
        >
          {MARKET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      {/* Stock code + fetch price button */}
      <div className="grid grid-cols-[1fr_130px] gap-2 items-end">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Stock Code
          <input
            className="theme-input"
            placeholder={selectedMarket.placeholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        <button
          type="button"
          onClick={fetchPrice}
          disabled={fetchingPrice}
          className="theme-button-secondary h-[50px] px-3 py-3 text-center"
        >
          {fetchingPrice ? "Fetching…" : "Fetch Price"}
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Buy-In Price{buyPriceCurrency ? ` (${buyPriceCurrency.toUpperCase()})` : ""}
        <input
          className="theme-input"
          placeholder="12.50 or leave blank for live price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Quantity
        <input
          className="theme-input disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="10"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={!!amountAud}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Amount (AUD)
        <input
          className="theme-input disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="500"
          value={amountAud}
          onChange={(e) => setAmountAud(e.target.value)}
          disabled={!!quantity}
        />
      </label>

      <button
        type="submit"
        disabled={adding}
        className="theme-button-primary w-full disabled:opacity-60"
      >
        {adding ? "Adding…" : "Add Stock"}
      </button>
    </form>
  );
}
