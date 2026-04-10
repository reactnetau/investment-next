"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { currencyFromTimezone } from "@/lib/currency";

const FEATURES = [
  { label: "Live ASX, NASDAQ, NSE & BSE prices", sub: "Real market data updated daily" },
  { label: "Track profit & loss", sub: "See performance across all your holdings" },
  { label: "Multiple portfolios", sub: "Test different strategies side-by-side" },
  { label: "No real money needed", sub: "Start with $10,000 in simulated cash" },
];

const MOCK_HOLDINGS = [
  { code: "BHP", change: "+4.21%", pl: "+$420", positive: true },
  { code: "AAPL", change: "+1.83%", pl: "+$183", positive: true },
  { code: "CBA", change: "-0.94%", pl: "-$94", positive: false },
];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
        currency: currencyFromTimezone(),
        profileName: profileName.trim() || "My Portfolio",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: email.trim(), password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* Left — App preview */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] text-white font-bold text-sm shadow-[0_12px_24px_rgba(34,197,94,0.25)]">IP</span>
              <span className="font-bold text-[var(--ink-strong)] text-lg tracking-tight">Investors Playground</span>
            </div>
            <p className="theme-kicker mb-5">Get started</p>
            <h1 className="text-3xl font-extrabold text-[var(--ink-strong)] leading-tight tracking-tight mb-3">
              Practice investing with live market prices.
            </h1>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed">
              Start with $10,000 in simulated cash. Buy and sell real ASX and NASDAQ stocks, track your performance, and build confidence — without risking a cent.
            </p>
          </div>

          {/* Mini portfolio mockup */}
          <div className="theme-card p-4 bg-white/95">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[var(--ink-strong)] uppercase tracking-wide">Portfolio</span>
              <span className="text-xs font-bold text-[var(--good)]">+$509 today</span>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {MOCK_HOLDINGS.map((h) => (
                <div
                  key={h.code}
                  className="flex justify-between items-center rounded-xl px-3 py-2 bg-[var(--surface-muted)]"
                >
                  <span className="text-sm font-bold text-[var(--ink-strong)]">{h.code}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${h.positive ? "text-[var(--good)]" : "text-[var(--bad)]"}`}>
                      {h.change}
                    </span>
                    <span className={`text-xs font-bold ${h.positive ? "text-[var(--good)]" : "text-[var(--bad)]"}`}>
                      {h.pl}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2">
                <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wide">Cash</div>
                <div className="text-sm font-bold text-[var(--ink-strong)]">$8,245.00</div>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2">
                <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wide">Total Value</div>
                <div className="text-sm font-bold text-[var(--good)]">$10,509.00</div>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <ul className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(34,197,94,0.12)] text-[var(--accent)] flex items-center justify-center text-xs font-bold">✓</span>
                <div>
                  <span className="text-sm font-semibold text-[var(--ink-strong)]">{f.label}</span>
                  <span className="text-xs text-[var(--ink-soft)] ml-2">{f.sub}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Registration form */}
        <div>
          <div className="theme-panel p-6 sm:p-7">
            <h2 className="text-lg font-bold text-[var(--ink-strong)] mb-1">Create your free account</h2>
            <p className="text-xs text-[var(--ink-soft)] mb-5">No credit card required.</p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-muted">
                Email
                <input
                  type="email"
                  className="theme-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Portfolio Name
                <input
                  type="text"
                  className="theme-input"
                  placeholder="My Portfolio"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  maxLength={40}
                />
                <span className="text-xs text-[var(--ink-soft)] mt-0.5">You can create more portfolios after signing up.</span>
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Password
                <input
                  type="password"
                  className="theme-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Confirm Password
                <input
                  type="password"
                  className="theme-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="theme-button-primary mt-1 w-full disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
