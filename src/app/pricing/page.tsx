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
    <div className="min-h-screen flex flex-col">
      <MarketingNav />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">

        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Start for free. Upgrade once if you need more. No subscriptions, no surprises.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">

          {/* Free */}
          <div
            className="rounded-2xl border border-line bg-panel p-8 flex flex-col"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-ink mb-1">Free</h2>
              <div className="text-4xl font-extrabold text-ink tracking-tight">$0</div>
              <p className="text-sm text-muted mt-1">Forever free. No credit card needed.</p>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="text-accent font-bold text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="block text-center rounded-xl border border-line bg-white text-ink font-bold py-3 text-sm hover:bg-[#f0ece3] transition"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl border-2 border-accent bg-panel p-8 flex flex-col relative"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-accent text-white text-xs font-bold px-4 py-1 tracking-wide">
                MOST POPULAR
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-ink mb-1">Pro</h2>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-extrabold text-ink tracking-tight">$5</div>
                <div className="text-muted text-sm mb-1.5">AUD one-off</div>
              </div>
              <p className="text-sm text-muted mt-1">Or $3 USD. Pay once, own it forever.</p>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="text-accent font-bold text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="block text-center rounded-xl bg-accent text-white font-bold py-3 text-sm hover:opacity-90 transition"
            >
              {isLoggedIn ? "Upgrade in Dashboard" : "Get Started Free"}
            </Link>
            {isLoggedIn && (
              <p className="text-xs text-muted text-center mt-2">
                Use the upgrade button inside your dashboard.
              </p>
            )}
          </div>

        </div>

        {/* Feature comparison */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-ink mb-6 text-center">What&apos;s included</h2>
          <div
            className="rounded-2xl border border-line overflow-hidden"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#efe6d8]">
                  <th className="text-left px-5 py-3 text-[#56483b] font-semibold text-xs uppercase tracking-wider">Feature</th>
                  <th className="text-center px-5 py-3 text-[#56483b] font-semibold text-xs uppercase tracking-wider">Free</th>
                  <th className="text-center px-5 py-3 text-accent font-semibold text-xs uppercase tracking-wider">Pro</th>
                </tr>
              </thead>
              <tbody className="bg-panel divide-y divide-line">
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
                  <tr key={feature} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="px-5 py-3 text-ink font-medium">{feature}</td>
                    <td className="px-5 py-3 text-center text-muted">{free}</td>
                    <td className="px-5 py-3 text-center text-accent font-semibold">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-ink mb-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-bold text-ink mb-1">{f.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-ink mb-3">Start practising today</h2>
          <p className="text-muted text-sm mb-6">Free forever. Upgrade when you&apos;re ready for more.</p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="inline-block rounded-xl bg-accent text-white font-bold px-8 py-4 hover:opacity-90 transition"
          >
            {isLoggedIn ? "Go to Dashboard" : "Create Free Account"}
          </Link>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
