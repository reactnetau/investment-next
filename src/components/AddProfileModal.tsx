"use client";

import { useState } from "react";
import { currencyFromTimezone } from "@/lib/currency";

interface Props {
  onCreated: (profileId: string) => void;
  onClose: () => void;
  onUpgradeRequired: () => void;
}

export function AddProfileModal({ onCreated, onClose, onUpgradeRequired }: Props) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<"aud" | "usd">(currencyFromTimezone() as "aud" | "usd");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a portfolio name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgrade) {
          onClose();
          onUpgradeRequired();
          return;
        }
        setError(data.error ?? "Failed to create portfolio.");
        return;
      }
      onCreated(data.profile.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <h2 className="text-lg font-bold text-ink mb-5">New Portfolio</h2>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Portfolio Name
            <input
              type="text"
              className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g. Long Term, Speculative, ETFs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Currency
            <select
              className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "aud" | "usd")}
            >
              <option value="aud">AUD</option>
              <option value="usd">USD</option>
            </select>
          </label>

          <p className="text-xs text-muted">
            Starts with {currency.toUpperCase()} $10,000 in cash. You can switch between portfolios at any time.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-line py-3 text-sm text-ink hover:bg-[#f0ece3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-accent py-3 text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition"
            >
              {loading ? "Creating…" : "Create Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
