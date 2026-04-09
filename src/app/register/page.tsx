"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { currencyFromTimezone } from "@/lib/currency";

const FEATURES = [
  { label: "Live ASX & NASDAQ prices", sub: "Real market data updated daily" },
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* Left — App preview */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-accent font-bold text-xl">●</span>
              <span className="font-bold text-ink text-lg tracking-tight">Investors Playground</span>
            </div>
            <h1 className="text-3xl font-extrabold text-ink leading-tight tracking-tight mb-3">
              Practice investing with live market prices.
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              Start with $10,000 in simulated cash. Buy and sell real ASX and NASDAQ stocks, track your performance, and build confidence — without risking a cent.
            </p>
          </div>

          {/* Mini portfolio mockup */}
          <div
            className="rounded-2xl border border-line bg-panel p-4"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-ink uppercase tracking-wide">Portfolio</span>
              <span className="text-xs font-bold text-good">+$509 today</span>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {MOCK_HOLDINGS.map((h) => (
                <div
                  key={h.code}
                  className="flex justify-between items-center rounded-xl px-3 py-2 bg-[#f6f2ea]"
                >
                  <span className="text-sm font-bold text-ink">{h.code}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${h.positive ? "text-good" : "text-bad"}`}>
                      {h.change}
                    </span>
                    <span className={`text-xs font-bold ${h.positive ? "text-good" : "text-bad"}`}>
                      {h.pl}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#f6f2ea] px-3 py-2">
                <div className="text-[10px] text-muted uppercase tracking-wide">Cash</div>
                <div className="text-sm font-bold text-ink">$8,245.00</div>
              </div>
              <div className="rounded-xl bg-[#f6f2ea] px-3 py-2">
                <div className="text-[10px] text-muted uppercase tracking-wide">Total Value</div>
                <div className="text-sm font-bold text-good">$10,509.00</div>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <ul className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">✓</span>
                <div>
                  <span className="text-sm font-semibold text-ink">{f.label}</span>
                  <span className="text-xs text-muted ml-2">{f.sub}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Registration form */}
        <div>
          <div className="rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
            <h2 className="text-lg font-bold text-ink mb-1">Create your free account</h2>
            <p className="text-xs text-muted mb-5">No credit card required.</p>

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
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
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
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="My Portfolio"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  maxLength={40}
                />
                <span className="text-xs text-muted mt-0.5">You can create more portfolios after signing up.</span>
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Password
                <input
                  type="password"
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Confirm Password
                <input
                  type="password"
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
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
