import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";
import { getSiteUrl } from "@/lib/app-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Investors Playground works. Create a free account, add ASX, NASDAQ, NSE and BSE stocks with live prices, track your portfolio, and build investing confidence — risk-free.",
  alternates: { canonical: `${siteUrl}/how-it-works` },
  openGraph: {
    title: "How Investors Playground Works",
    description:
      "A step-by-step guide to practising investing with live ASX, NASDAQ, NSE and BSE prices. No real money required.",
    url: `${siteUrl}/how-it-works`,
    type: "article",
  },
};

const STEPS = [
  {
    n: "01",
    title: "Create a free account",
    body: "Sign up with your email and password. No credit card required, no trial periods — just a free account with full access to the simulator. You start with $10,000 in simulated cash.",
  },
  {
    n: "02",
    title: "Add stocks to your portfolio",
    body: 'Enter any ASX ticker (e.g. BHP, CBA, WES), NASDAQ/NYSE ticker (e.g. AAPL, MSFT, TSLA), or Indian stock with its exchange suffix (e.g. RELIANCE.NS for NSE, TCS.BO for BSE) and click "Fetch Price" to pull the current live price. You can also enter a manual buy-in price if you want to backtest a historical entry point.',
  },
  {
    n: "03",
    title: "Choose how much to invest",
    body: "Enter either a quantity (number of shares) or a dollar amount. The simulator deducts the cost from your simulated cash and adds the holding to your portfolio.",
  },
  {
    n: "04",
    title: "Prices update every day",
    body: "Live prices are fetched from Yahoo Finance and updated automatically each day. Your portfolio value, P/L, and percentage changes all reflect real market movements.",
  },
  {
    n: "05",
    title: "Track your performance",
    body: "Your dashboard shows every holding's buy price, current price, percentage change, days held, amount invested, current value, and profit or loss — all in your local currency (AUD, USD or INR).",
  },
  {
    n: "06",
    title: "Sell and reset whenever you like",
    body: "Sell any holding at the current price and the proceeds return to your cash balance. Reset your entire portfolio at any time to start fresh with $10,000. There are no consequences — this is a simulator.",
  },
];

const FAQS = [
  {
    q: "Is this real money?",
    a: "No. Every dollar in Investors Playground is simulated. You cannot win or lose real money. It exists purely as a learning and practice environment.",
  },
  {
    q: "Where do the prices come from?",
    a: "Prices are sourced from Yahoo Finance, which aggregates real market data from the ASX, NASDAQ, NSE and BSE. They are updated daily via an automated process.",
  },
  {
    q: "Which exchanges are supported?",
    a: "ASX, NASDAQ, NYSE, NSE and BSE are all supported. ASX tickers are typically 3 letters (BHP, CBA, NAB). NASDAQ/NYSE use standard US codes (AAPL, GOOGL, AMZN). For Indian stocks, append the exchange suffix: .NS for NSE (e.g. RELIANCE.NS) or .BO for BSE (e.g. TCS.BO). Currency conversion is handled automatically.",
  },
  {
    q: "What is the difference between the free and Pro plans?",
    a: "Free accounts can hold up to 5 stocks in a single portfolio. Pro accounts (a one-off payment) unlock unlimited holdings and multiple portfolios. All other features — live prices, P/L tracking, selling, resetting — are available on both plans.",
  },
  {
    q: "Does this teach me to trade?",
    a: "Investors Playground is a practice tool, not a course. It teaches you how portfolio tracking works, how price changes affect your total value, and gives you a feel for real market movements. It is not financial advice.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">

        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
            How it works
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            From sign-up to your first portfolio, here is exactly what happens when you use Investors Playground.
          </p>
        </div>

        {/* Steps */}
        <section className="mb-16">
          <div className="flex flex-col gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-accent/10 text-accent font-extrabold text-sm flex items-center justify-center">
                  {s.n}
                </div>
                <div className="pt-1">
                  <h2 className="text-base font-bold text-ink mb-1">{s.title}</h2>
                  <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section className="mb-16 rounded-2xl border border-line bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
          <h2 className="text-xl font-extrabold text-ink mb-6">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Simulated starting cash", "Every account starts with simulated cash to invest (₹8,00,000 for INR portfolios, $10,000 for AUD/USD)."],
              ["Live ASX, NASDAQ, NSE & BSE prices", "Real market data from Yahoo Finance, updated daily."],
              ["AUD, USD & INR support", "Prices automatically converted to your portfolio currency."],
              ["Profit & loss tracking", "See exactly how each holding is performing."],
              ["Sell anytime", "Liquidate any position instantly at the current market price."],
              ["Portfolio reset", "Restart from scratch at any time — no consequences."],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-accent text-sm mt-0.5">✓</span>
                <div>
                  <div className="text-sm font-semibold text-ink">{title}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
              </div>
            ))}
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
          <h2 className="text-2xl font-extrabold text-ink mb-3">Ready to start?</h2>
          <p className="text-muted text-sm mb-6">Free to join. No credit card required.</p>
          <Link
            href="/register"
            className="inline-block rounded-xl bg-accent text-white font-bold px-8 py-4 hover:opacity-90 transition"
          >
            Create Free Account
          </Link>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
