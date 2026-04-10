import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";
import { getSiteUrl } from "@/lib/app-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Investors Playground is free to start. The free plan includes live ASX, NASDAQ, NSE and BSE prices, portfolio tracking, and up to 5 stock holdings. Upgrade to Pro with a single one-off payment for unlimited holdings.",
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: "Pricing — Investors Playground",
    description:
      "Free to start. Upgrade to Pro with a single one-off payment for unlimited holdings and multiple portfolios.",
    url: `${siteUrl}/pricing`,
    type: "website",
  },
};

const FREE_FEATURES = [
  "Up to 5 stock holdings",
  "1 portfolio",
  "Live ASX, NASDAQ, NSE & BSE prices",
  "Profit & loss tracking",
  "Buy and sell simulation",
  "Portfolio reset",
  "AUD, USD & INR support",
];

const PRO_FEATURES = [
  "Unlimited stock holdings",
  "Unlimited portfolios",
  "Live ASX, NASDAQ, NSE & BSE prices",
  "Profit & loss tracking",
  "Buy and sell simulation",
  "Portfolio reset",
  "AUD, USD & INR support",
  "One-off payment — no subscription",
];

const FAQS = [
  {
    q: "Is the free plan actually free?",
    a: "Yes. No credit card, no trial period, no hidden fees. The free plan is permanently free. You can use Investors Playground indefinitely on the free plan.",
  },
  {
    q: "Why is the Pro plan a one-off payment?",
    a: "We believe in simple, honest pricing. You pay once and have Pro access permanently. There is no monthly subscription to cancel.",
  },
  {
    q: "What is a portfolio?",
    a: "A portfolio is a separate set of holdings and cash balance. Free users have one portfolio. Pro users can create unlimited portfolios — useful for testing different strategies side-by-side.",
  },
  {
    q: "Can I get a refund?",
    a: "If you have an issue with your purchase, contact us via the support page and we will sort it out.",
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <div className="theme-shell flex flex-col">
      <MarketingNav />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="theme-kicker mb-4">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink-strong)] tracking-tight mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-[var(--ink-soft)] max-w-xl mx-auto">
            Start for free. Upgrade once if you need more. No subscriptions, no surprises.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">

          {/* Free */}
          <div className="theme-card p-8 flex flex-col bg-white/95">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[var(--ink-strong)] mb-1">Free</h2>
              <div className="text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">$0</div>
              <p className="text-sm text-[var(--ink-soft)] mt-1">Forever free. No credit card needed.</p>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--ink-strong)]">
                  <span className="text-[var(--accent)] font-bold text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="theme-button-secondary w-full"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-[28px] p-8 flex flex-col relative text-white shadow-[0_18px_45px_rgba(34,197,94,0.2)] bg-[linear-gradient(135deg,#22c55e_0%,#1ea96c_48%,#60a5fa_100%)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-white/18 text-white text-xs font-bold px-4 py-1 tracking-wide">
                MOST POPULAR
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-1">Pro</h2>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-extrabold text-white tracking-tight">$5</div>
                <div className="text-white/80 text-sm mb-1.5">AUD one-off</div>
              </div>
              <p className="text-sm text-white/80 mt-1">Or $3 USD. Pay once, own it forever.</p>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/95">
                  <span className="text-white font-bold text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="block text-center rounded-2xl bg-white text-[var(--ink-strong)] font-bold py-3 text-sm hover:bg-white/90 transition"
            >
              {isLoggedIn ? "Upgrade in Dashboard" : "Get Started Free"}
            </Link>
            {isLoggedIn && (
              <p className="text-xs text-white/80 text-center mt-2">
                Use the upgrade button inside your dashboard.
              </p>
            )}
          </div>

        </div>

        {/* Feature comparison */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-[var(--ink-strong)] mb-6 text-center">What&apos;s included</h2>
          <div className="theme-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[rgba(224,239,255,0.6)]">
                  <th className="text-left px-5 py-3 text-[var(--ink-soft)] font-semibold text-xs uppercase tracking-wider">Feature</th>
                  <th className="text-center px-5 py-3 text-[var(--ink-soft)] font-semibold text-xs uppercase tracking-wider">Free</th>
                  <th className="text-center px-5 py-3 text-[var(--accent)] font-semibold text-xs uppercase tracking-wider">Pro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--line)]">
                {[
                  ["Stock holdings", "Up to 5", "Unlimited"],
                  ["Portfolios", "1", "Unlimited"],
                  ["Live ASX & NASDAQ prices", "✓", "✓"],
                  ["Live NSE & BSE prices", "✓", "✓"],
                  ["Profit & loss tracking", "✓", "✓"],
                  ["Buy & sell simulation", "✓", "✓"],
                  ["Portfolio reset", "✓", "✓"],
                  ["AUD, USD & INR support", "✓", "✓"],
                  ["Price", "Free", "$5 AUD once"],
                ].map(([feature, free, pro]) => (
                  <tr key={feature} className="hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="px-5 py-3 text-[var(--ink-strong)] font-medium">{feature}</td>
                    <td className="px-5 py-3 text-center text-[var(--ink-soft)]">{free}</td>
                    <td className="px-5 py-3 text-center text-[var(--accent)] font-semibold">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-[var(--ink-strong)] mb-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-bold text-[var(--ink-strong)] mb-1">{f.q}</h3>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[var(--ink-strong)] mb-3">Start practising today</h2>
          <p className="text-[var(--ink-soft)] text-sm mb-6">Free forever. Upgrade when you&apos;re ready for more.</p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="theme-button-primary px-8 py-4"
          >
            {isLoggedIn ? "Go to Dashboard" : "Create Free Account"}
          </Link>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
