"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

const BENEFITS = [
  { icon: "📁", label: "Multiple portfolios", detail: "Track different strategies separately — long-term, speculative, ETFs, and more." },
  { icon: "📈", label: "Unlimited stocks", detail: "Hold as many positions as you like. Free accounts are capped at 5." },
  { icon: "⚡", label: "One-off payment", detail: "No subscriptions. Pay once and own it forever." },
];

function getUserLocale(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  return tz.startsWith("America/") ? "usd" : "aud";
}

export function UpgradeModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const locale = getUserLocale();
  const priceLabel = locale === "usd" ? "$3.00 USD" : "$5.00 AUD";

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) {
        setError("Could not start checkout. Please try again.");
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-lg bg-[#d8a23d] text-[#2e2416] text-xs font-bold px-2.5 py-1 tracking-wide">
                PRO
              </span>
            </div>
            <h2 className="text-xl font-bold text-ink">Upgrade to Pro</h2>
            <p className="text-sm text-muted mt-1">One-off payment — no subscription, ever.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:bg-[#f0ece3] transition"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-3 mb-6">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{b.label}</p>
                <p className="text-xs text-muted mt-0.5">{b.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full rounded-xl bg-[#d8a23d] text-[#2e2416] font-bold py-3.5 text-base hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? "Redirecting to checkout…" : `Go Pro — ${priceLabel} one-off`}
        </button>

        <p className="text-center text-xs text-muted mt-3">
          Secure checkout via Stripe. Instant access after payment.
        </p>
      </div>
    </div>
  );
}
