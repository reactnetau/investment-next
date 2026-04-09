"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";

interface Props {
  onAdded: () => void;
  onUpgradeRequired: () => void;
}

export function AddHoldingForm({ onAdded, onUpgradeRequired }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amountAud, setAmountAud] = useState("");
  const [buyPriceCurrency, setBuyPriceCurrency] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [adding, setAdding] = useState(false);

  async function fetchPrice() {
    if (!code.trim()) {
      enqueueSnackbar("Enter a stock code before fetching a live price.", { variant: "warning" });
      return;
    }
    setFetchingPrice(true);
    enqueueSnackbar(`Fetching live price for ${code.trim().toUpperCase()}…`, { variant: "info" });

    try {
      const res = await fetch(`/api/price?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        enqueueSnackbar(data?.error || `Could not fetch a live price for ${code.trim().toUpperCase()} right now.`, { variant: "error" });
        return;
      }
      // Always expect { price: { price: number, currency: string }, convertedPrice?: number, portfolioCurrency?: string }
      const priceObj = data.price;
      const livePrice = priceObj?.price;
      const nativeCurrency: string = priceObj?.currency || "";
      if (typeof livePrice !== "number" || isNaN(livePrice) || !isFinite(livePrice)) {
        enqueueSnackbar(`Could not fetch a valid price for ${code.trim().toUpperCase()}.`, { variant: "error" });
        return;
      }
      // If stock is in a different currency to the portfolio, show and use the converted price
      const convertedPrice: number | null = data.convertedPrice ?? null;
      const portfolioCurrency: string = data.portfolioCurrency || nativeCurrency;
      const displayPrice = convertedPrice !== null ? convertedPrice : livePrice;
      const displayCurrency = convertedPrice !== null ? portfolioCurrency : nativeCurrency;
      const formatted = parseFloat(displayPrice.toFixed(4))
        .toString()
        .replace(/\.?0+$/, "");
      setBuyPrice(formatted);
      setBuyPriceCurrency(displayCurrency);
      setExchange(nativeCurrency === "aud" ? "ASX" : "NASDAQ");
      enqueueSnackbar(`Fetched live price for ${code.trim().toUpperCase()}: ${displayCurrency.toUpperCase()} $${displayPrice.toFixed(2)}`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Error fetching price: ${err instanceof Error ? err.message : String(err)}`, { variant: "error" });
    } finally {
      setFetchingPrice(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);

    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
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
    setExchange("");
    setQuantity("");
    setAmountAud("");
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Stock code + fetch price button */}
      <div className="grid grid-cols-[1fr_130px] gap-2 items-end">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Stock Code{exchange ? ` (${exchange})` : ""}
          <input
            className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="BHP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        <button
          type="button"
          onClick={fetchPrice}
          disabled={fetchingPrice}
          className="rounded-xl bg-[#d8a23d] text-[#2e2416] font-bold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
        >
          {fetchingPrice ? "Fetching…" : "Fetch Price"}
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Buy-In Price{buyPriceCurrency ? ` (${buyPriceCurrency.toUpperCase()})` : ""}
        <input
          className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="12.50 or leave blank for live price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Quantity
        <input
          className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="10"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={!!amountAud}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Amount (AUD)
        <input
          className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="500"
          value={amountAud}
          onChange={(e) => setAmountAud(e.target.value)}
          disabled={!!quantity}
        />
      </label>

      <button
        type="submit"
        disabled={adding}
        className="rounded-xl bg-accent text-white font-bold py-3 text-base hover:opacity-90 disabled:opacity-60 transition"
      >
        {adding ? "Adding…" : "Add Stock"}
      </button>
    </form>
  );
}
