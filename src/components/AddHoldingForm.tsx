"use client";

import { useState } from "react";

interface Props {
  onAdded: () => void;
  onStatus: (msg: string) => void;
  onUpgradeRequired: () => void;
}

export function AddHoldingForm({ onAdded, onStatus, onUpgradeRequired }: Props) {
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amountAud, setAmountAud] = useState("");
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [adding, setAdding] = useState(false);

  async function fetchPrice() {
    if (!code.trim()) {
      onStatus("Enter a stock code before fetching a live price.");
      return;
    }
    setFetchingPrice(true);
    onStatus(`Fetching live price for ${code.trim().toUpperCase()}…`);

    try {
      const res = await fetch(`/api/price?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        onStatus(data?.error || `Could not fetch a live price for ${code.trim().toUpperCase()} right now.`);
        return;
      }
      // Always expect { price: { price: number, currency: string } }
      const priceObj = data.price;
      const livePrice = priceObj?.price;
      const currency = priceObj?.currency || "";
      if (typeof livePrice !== "number" || isNaN(livePrice) || !isFinite(livePrice)) {
        onStatus(`Could not fetch a valid price for ${code.trim().toUpperCase()}.`);
        return;
      }
      const formatted = parseFloat(livePrice.toFixed(4))
        .toString()
        .replace(/\.?0+$/, "");
      setBuyPrice(formatted);
      onStatus(`Fetched live price for ${code.trim().toUpperCase()}: ${currency.toUpperCase()} $${livePrice.toFixed(2)}`);
    } catch (err) {
      onStatus(`Error fetching price: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setFetchingPrice(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    onStatus("Adding stock…");

    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
        buyPrice: buyPrice || undefined,
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
      onStatus(data.error ?? "Failed to add stock.");
      return;
    }

    const data = await res.json();
    onStatus(data.message);
    setCode("");
    setBuyPrice("");
    setQuantity("");
    setAmountAud("");
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Stock code + fetch price button */}
      <div className="grid grid-cols-[1fr_130px] gap-2 items-end">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Stock Code
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
        Buy-In Price
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
