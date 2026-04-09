import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/app-url";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";

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

      <div className="min-h-screen flex flex-col">
        <MarketingNav />

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-1.5 text-xs font-semibold text-accent mb-8">
            Live ASX, NASDAQ, NSE &amp; BSE prices
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-ink leading-tight tracking-tight mb-6">
            Build investing confidence<br className="hidden sm:block" /> before you risk real money.
          </h1>
          <p className="text-lg text-muted max-w-2xl mb-10 leading-relaxed">
            Investors Playground is a free stock market simulator. Practice buying and selling real stocks from the ASX, NASDAQ, NSE and BSE using live prices, track your portfolio, and learn the markets — completely risk-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="rounded-xl bg-accent text-white font-bold text-base px-8 py-4 hover:opacity-90 transition"
            >
              Start for Free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-line bg-panel text-ink font-bold text-base px-8 py-4 hover:bg-[#f0ece3] transition"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-ink text-center mb-3 tracking-tight">
              Everything you need to practise investing
            </h2>
            <p className="text-center text-muted mb-12 max-w-xl mx-auto">
              A full portfolio simulator with real market data — no sign-up fees, no complexity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-line bg-panel p-6"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <h3 className="text-base font-bold text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 bg-panel border-y border-line">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-ink text-center mb-12 tracking-tight">
              How it works
            </h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              {STEPS.map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-accent text-white font-extrabold text-xl flex items-center justify-center mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-ink mb-1">{s.title}</h3>
                  <p className="text-sm text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-ink mb-4 tracking-tight">
              Ready to start practising?
            </h2>
            <p className="text-muted mb-8">
              Free to get started. No credit card required. Upgrade to Pro for unlimited holdings with a single one-off payment.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-accent text-white font-bold text-base px-10 py-4 hover:opacity-90 transition"
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
