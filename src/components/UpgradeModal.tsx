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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.2)] relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[rgba(96,165,250,0.18)] via-transparent to-[rgba(34,197,94,0.18)]" />
        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-[rgba(224,239,255,0.8)] text-blue-700 text-xs font-bold px-3 py-1 tracking-wide">
                PRO
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--ink-strong)]">Upgrade to Pro</h2>
            <p className="text-sm text-[var(--ink-soft)] mt-1">One-off payment — no subscription, ever.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-2xl text-[var(--ink-soft)] hover:bg-white transition"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-3 mb-6 relative z-10">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
              <span className="text-xl leading-none mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--ink-strong)]">{b.label}</p>
                <p className="text-xs text-[var(--ink-soft)] mt-0.5">{b.detail}</p>
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
          className="theme-button-primary w-full text-base disabled:opacity-60 relative z-10"
        >
          {loading ? "Redirecting to checkout…" : `Go Pro — ${priceLabel} one-off`}
        </button>

        <p className="text-center text-xs text-[var(--ink-soft)] mt-3 relative z-10">
          Secure checkout via Stripe. Instant access after payment.
        </p>
      </div>
    </div>
  );
}
