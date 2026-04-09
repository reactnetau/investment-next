import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";
import { getSiteUrl } from "@/lib/app-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "ASX vs NASDAQ — What's the Difference?",
  description:
    "A clear comparison of the ASX (Australian Securities Exchange) and NASDAQ. Learn the key differences in trading hours, currency, sectors, and how both work in Investors Playground.",
  alternates: { canonical: `${siteUrl}/asx-vs-nasdaq` },
  openGraph: {
    title: "ASX vs NASDAQ — What's the Difference?",
    description:
      "ASX vs NASDAQ: trading hours, currency, top sectors, and how to trade both in a risk-free simulator.",
    url: `${siteUrl}/asx-vs-nasdaq`,
    type: "article",
  },
};

export default function AsxVsNasdaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
            ASX vs NASDAQ
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Two of the most traded stock exchanges in the world — one Australian, one American. Here is what makes them different, what kinds of companies you will find on each, and how both work inside Investors Playground.
          </p>
        </div>

        <div className="flex flex-col gap-12">

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">What is the ASX?</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              The <strong className="text-ink">Australian Securities Exchange (ASX)</strong> is Australia&apos;s primary stock exchange, headquartered in Sydney. It is one of the largest exchanges in the Asia-Pacific region and home to over 2,000 listed companies.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              The ASX is best known for its heavy weighting towards resources, mining, banking, and financials. Companies like BHP, Rio Tinto, Commonwealth Bank, and Wesfarmers are among its largest and most traded stocks.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              The ASX trades in <strong className="text-ink">Australian dollars (AUD)</strong> and is open Monday to Friday from <strong className="text-ink">10:00 AM to 4:00 PM AEST</strong> (with a pre-open phase from 7:00 AM). This means it operates during Australian business hours, making it naturally accessible for Australian investors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">What is NASDAQ?</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              <strong className="text-ink">NASDAQ</strong> (National Association of Securities Dealers Automated Quotations) is the second-largest stock exchange in the world by market capitalisation. It is based in New York and lists over 3,000 companies.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              NASDAQ is globally renowned for its concentration of technology and growth companies. Apple, Microsoft, Amazon, Alphabet (Google), Meta, and Tesla are all listed on NASDAQ. The exchange is strongly associated with the technology sector, though it also lists healthcare, consumer, and financial companies.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              NASDAQ trades in <strong className="text-ink">US dollars (USD)</strong> and is open Monday to Friday from <strong className="text-ink">9:30 AM to 4:00 PM Eastern Time (ET)</strong> — which is 1:30 AM to 8:00 AM AEST the following day, meaning Australian investors are often trading after hours.
            </p>
          </section>

          {/* Comparison table */}
          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-6">Key differences at a glance</h2>
            <div className="rounded-2xl border border-line overflow-hidden" style={{ boxShadow: "var(--shadow)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#efe6d8]">
                    <th className="text-left px-5 py-3 text-[#56483b] font-semibold text-xs uppercase tracking-wider w-1/3"></th>
                    <th className="text-center px-5 py-3 text-[#56483b] font-semibold text-xs uppercase tracking-wider">ASX</th>
                    <th className="text-center px-5 py-3 text-[#56483b] font-semibold text-xs uppercase tracking-wider">NASDAQ</th>
                  </tr>
                </thead>
                <tbody className="bg-panel divide-y divide-line">
                  {[
                    ["Country", "Australia", "United States"],
                    ["Currency", "AUD (A$)", "USD (US$)"],
                    ["Trading hours (local)", "10:00 AM – 4:00 PM AEST", "9:30 AM – 4:00 PM ET"],
                    ["Trading hours (AEST)", "10:00 AM – 4:00 PM", "1:30 AM – 8:00 AM (next day)"],
                    ["Listed companies", "~2,200+", "~3,300+"],
                    ["Dominant sectors", "Mining, banks, resources", "Technology, healthcare, growth"],
                    ["Index benchmark", "ASX 200 (XJO)", "NASDAQ Composite / NASDAQ 100"],
                    ["Example companies", "BHP, CBA, WES, RIO, CSL", "AAPL, MSFT, AMZN, GOOGL, TSLA"],
                    ["Ticker format", "3 letters (BHP, NAB)", "Varies (AAPL, GOOGL, META)"],
                  ].map(([label, asx, nasdaq]) => (
                    <tr key={label} className="hover:bg-[#faf7f2] transition-colors">
                      <td className="px-5 py-3 text-ink font-medium">{label}</td>
                      <td className="px-5 py-3 text-center text-muted">{asx}</td>
                      <td className="px-5 py-3 text-center text-muted">{nasdaq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">Sectors and what you will find</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-line bg-panel p-5" style={{ boxShadow: "var(--shadow)" }}>
                <h3 className="font-bold text-ink mb-3">ASX — Major sectors</h3>
                <ul className="flex flex-col gap-2 text-sm text-muted">
                  {[
                    ["Materials & Mining", "BHP, RIO, FMG, S32"],
                    ["Financials & Banking", "CBA, NAB, ANZ, WBC"],
                    ["Consumer Staples", "WES, WOW, COL"],
                    ["Healthcare", "CSL, RMD, COH"],
                    ["Energy", "WDS, STO, BPT"],
                    ["Real Estate (A-REITs)", "GMG, SCG, VCX"],
                  ].map(([sector, examples]) => (
                    <li key={sector} className="flex justify-between gap-2">
                      <span>{sector}</span>
                      <span className="text-xs text-muted/70">{examples}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-5" style={{ boxShadow: "var(--shadow)" }}>
                <h3 className="font-bold text-ink mb-3">NASDAQ — Major sectors</h3>
                <ul className="flex flex-col gap-2 text-sm text-muted">
                  {[
                    ["Technology", "AAPL, MSFT, NVDA, META"],
                    ["Consumer Discretionary", "AMZN, TSLA, NFLX"],
                    ["Communication Services", "GOOGL, META, NFLX"],
                    ["Healthcare & Biotech", "AMGN, GILD, BIIB"],
                    ["Financials", "PYPL, FISV, COIN"],
                    ["Industrials", "HON, ODFL, FAST"],
                  ].map(([sector, examples]) => (
                    <li key={sector} className="flex justify-between gap-2">
                      <span>{sector}</span>
                      <span className="text-xs text-muted/70">{examples}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">Currency and exchange rates</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              One important consideration when mixing ASX and NASDAQ stocks in the same portfolio is currency. ASX stocks are priced in AUD. NASDAQ stocks are priced in USD. If your portfolio is set to AUD, any US stocks you hold are automatically converted at the current AUD/USD exchange rate.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              This means your returns are affected by two things simultaneously: the stock&apos;s price movement <em>and</em> the AUD/USD exchange rate. If the AUD strengthens against the USD, your US stocks are worth less in AUD terms — even if the stock price itself went up.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Investors Playground handles this automatically. All values are displayed in your portfolio currency (AUD or USD), and conversions are done at the live exchange rate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">Which exchange is better for beginners?</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Neither is objectively better — it depends on your goals, interests, and where you plan to invest real money eventually.
            </p>
            <div className="flex flex-col gap-4">
              {[
                {
                  title: "Start with the ASX if…",
                  points: [
                    "You are Australian and planning to invest real money in Australia",
                    "You want to understand companies you interact with daily (banks, supermarkets, miners)",
                    "You prefer a simpler currency situation (everything in AUD)",
                    "You are interested in dividends — many ASX blue chips pay strong franked dividends",
                  ],
                  positive: true,
                },
                {
                  title: "Start with NASDAQ if…",
                  points: [
                    "You are drawn to technology and high-growth companies",
                    "You want exposure to some of the world's largest companies by market cap",
                    "You are comfortable tracking in USD",
                    "You are interested in growth investing rather than income/dividends",
                  ],
                  positive: true,
                },
              ].map((section) => (
                <div key={section.title} className="rounded-2xl border border-line bg-panel p-5" style={{ boxShadow: "var(--shadow)" }}>
                  <h3 className="text-sm font-bold text-ink mb-3">{section.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {section.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted">
                        <span className="text-accent mt-0.5 shrink-0">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted leading-relaxed mt-4">
              The best approach for learning is to try both. Create an ASX-focused portfolio and a NASDAQ-focused portfolio, run them in parallel, and see which suits your investing style. Investors Playground lets you do exactly this with the multiple portfolios feature.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">How ASX and NASDAQ work in Investors Playground</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Investors Playground supports stocks from both exchanges with no extra setup required.
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Adding an ASX stock",
                  body: 'Enter the 3-letter ticker (e.g. BHP, CBA, WES) in the stock code field and click "Fetch Price". The live ASX price is retrieved automatically in AUD.',
                },
                {
                  label: "Adding a NASDAQ or NYSE stock",
                  body: 'Enter the US ticker code (e.g. AAPL, MSFT, TSLA) and click "Fetch Price". The live USD price is retrieved and converted to your portfolio currency at the current exchange rate.',
                },
                {
                  label: "Mixed portfolios",
                  body: "You can hold ASX and NASDAQ stocks in the same portfolio. All values are shown in your portfolio currency. The exchange column in your holdings table shows whether each stock is ASX or NASDAQ.",
                },
                {
                  label: "Price updates",
                  body: "Prices for both exchanges are updated once daily via an automated process. The dashboard shows when prices were last refreshed and when the next update is due.",
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-accent mt-0.5 shrink-0 text-sm">→</span>
                  <div>
                    <span className="text-sm font-semibold text-ink">{item.label}: </span>
                    <span className="text-sm text-muted">{item.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-accent bg-panel p-8 text-center" style={{ boxShadow: "var(--shadow)" }}>
            <h2 className="text-xl font-extrabold text-ink mb-2">Practice trading ASX and NASDAQ stocks</h2>
            <p className="text-sm text-muted mb-6">
              Create a free account and start building your simulated portfolio with live prices from both exchanges.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-accent text-white font-bold px-8 py-3 hover:opacity-90 transition"
            >
              Get Started Free
            </Link>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
