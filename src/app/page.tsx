import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { getSiteUrl } from "@/lib/app-url";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";
import schmappsLogo from "@/assets/schmappslogo.png";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Investors Playground — Practice Investing with Live ASX, NASDAQ, NSE & BSE Prices",
  description:
    "Build investing confidence before you risk real money. Practice with live ASX, NASDAQ, NSE and BSE prices, track your portfolio performance, and learn the markets completely risk-free.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Investors Playground — Practice Investing with Live ASX, NASDAQ, NSE & BSE Prices",
    description:
      "Build investing confidence before you risk real money. Practice with live ASX, NASDAQ, NSE and BSE prices, track your portfolio performance, and learn the markets completely risk-free.",
    url: siteUrl,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Investors Playground",
  url: siteUrl,
  description:
    "A risk-free investment simulator that uses live ASX, NASDAQ, NSE and BSE prices. Practice buying and selling stocks, track your portfolio performance, and build investing confidence without risking real money.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "AUD",
      description: "Free access with up to 5 stock holdings.",
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "5.00",
      priceCurrency: "AUD",
      description: "One-off payment for unlimited stock holdings.",
    },
  ],
  featureList: [
    "Live ASX stock prices",
    "Live NASDAQ stock prices",
    "Live NSE stock prices",
    "Live BSE stock prices",
    "Portfolio tracking",
    "Profit and loss tracking",
    "Multiple portfolios",
    "Risk-free paper trading",
  ],
};

const FEATURES = [
  {
    title: "Live ASX, NASDAQ, NSE & BSE Prices",
    description:
      "Buy and sell real stocks using live market data from the ASX, NASDAQ, NSE and BSE. Prices update daily so your simulation reflects real market conditions.",
  },
  {
    title: "Portfolio Tracking",
    description:
      "See your profit and loss, percentage change, days held, and total portfolio value at a glance. All values shown in your local currency.",
  },
  {
    title: "Risk-Free Practice",
    description:
      "Start with $10,000 in simulated cash. Make mistakes, learn from them, and build confidence — without putting any real money on the line.",
  },
  {
    title: "Multiple Portfolios",
    description:
      "Test different strategies side-by-side with multiple portfolio profiles. Switch between them instantly from your dashboard.",
  },
];

const STEPS = [
  { step: "1", title: "Create a free account", body: "Sign up in seconds. No credit card required." },
  { step: "2", title: "Add stocks", body: "Search any ASX, NASDAQ, NSE or BSE ticker. Live prices are fetched automatically." },
  { step: "3", title: "Track your performance", body: "Watch your portfolio grow (or learn from the dips) in real time." },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="theme-shell flex flex-col">
        <MarketingNav />

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 sm:pt-20 w-full">
          <div className="theme-panel overflow-hidden px-6 py-10 sm:px-10 sm:py-14 text-center relative">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-[rgba(96,165,250,0.12)] via-transparent to-[rgba(34,197,94,0.12)]" />
          <div className="mb-6 inline-flex items-center gap-3 rounded-[28px] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm relative z-10">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_12px_24px_rgba(34,197,94,0.14)]">
              <Image src={schmappsLogo} alt="Schmapps logo" className="h-9 w-9 object-contain" priority />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Schmapps</p>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">Investors Playground</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/85 px-4 py-1.5 text-xs font-semibold text-[var(--accent)] mb-8 relative z-10">
            Live ASX, NASDAQ, NSE &amp; BSE prices
          </div>
          <div className="theme-kicker mb-6 relative z-10">Risk-free practice</div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-[var(--ink-strong)] leading-tight tracking-tight mb-6 relative z-10">
            Build investing confidence<br className="hidden sm:block" /> before you risk real money.
          </h1>
          <p className="text-lg text-[var(--ink-soft)] max-w-2xl mb-10 leading-relaxed mx-auto relative z-10">
            Investors Playground is a free stock market simulator. Practice buying and selling real stocks from the ASX, NASDAQ, NSE and BSE using live prices, track your portfolio, and learn the markets — completely risk-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link
              href="/register"
              className="theme-button-primary px-8 py-4"
            >
              Start for Free
            </Link>
            <Link
              href="/login"
              className="theme-button-secondary px-8 py-4"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 text-left">
            {[
              'Live market prices across four exchanges',
              'Practice portfolios without real risk',
              'Clean tracking with less financial noise',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/60 bg-white/76 px-4 py-3 text-sm text-[var(--ink-soft)] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                {item}
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-[0.24em] text-center mb-3">Everything you need</p>
            <h2 className="text-3xl font-extrabold text-[var(--ink-strong)] text-center mb-3 tracking-tight">
              Everything you need to practise investing
            </h2>
            <p className="text-center text-[var(--ink-soft)] mb-12 max-w-xl mx-auto">
              A full portfolio simulator with real market data — no sign-up fees, no complexity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="theme-card p-6 sm:p-7 bg-white/95"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-lg font-bold text-[var(--accent)]">↗</div>
                  <h3 className="text-base font-bold text-[var(--ink-strong)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-[var(--ink-strong)] text-center mb-12 tracking-tight">
              How it works
            </h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              {STEPS.map((s) => (
                <div key={s.step} className="theme-card flex flex-col items-center text-center flex-1 p-6 sm:p-7 bg-white/95">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-[0_12px_24px_rgba(34,197,94,0.25)]">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-[var(--ink-strong)] mb-1">{s.title}</h3>
                  <p className="text-sm text-[var(--ink-soft)]">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-[var(--ink-strong)] mb-4 tracking-tight">
              Ready to start practising?
            </h2>
            <p className="text-[var(--ink-soft)] mb-8">
              Free to get started. No credit card required. Upgrade to Pro for unlimited holdings with a single one-off payment.
            </p>
            <Link
              href="/register"
              className="theme-button-primary px-10 py-4"
            >
              Create Free Account
            </Link>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </>
  );
}
