import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav, MarketingFooter } from "@/components/MarketingNav";
import { getSiteUrl } from "@/lib/app-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Paper Trading Guide — Learn to Invest Risk-Free",
  description:
    "A complete guide to paper trading. Learn what paper trading is, why it works, how to get the most out of it, and common mistakes to avoid before investing real money.",
  alternates: { canonical: `${siteUrl}/paper-trading-guide` },
  openGraph: {
    title: "Paper Trading Guide — Learn to Invest Risk-Free",
    description:
      "Everything you need to know about paper trading: what it is, why it works, and how to use it to build real investing confidence.",
    url: `${siteUrl}/paper-trading-guide`,
    type: "article",
  },
};

export default function PaperTradingGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
            The beginner&apos;s guide to paper trading
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Before you put real money into the stock market, paper trading lets you practise with real prices, no real risk, and no real consequences. Here is everything you need to know.
          </p>
        </div>

        <div className="prose-custom flex flex-col gap-12">

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">What is paper trading?</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Paper trading — also called simulated trading or virtual trading — is the practice of buying and selling stocks using fake money, but at real market prices. The name comes from the old practice of writing down hypothetical trades on paper to track how they would have performed.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Today, paper trading is done digitally using simulators like Investors Playground. You get a simulated cash balance, look up real live prices, and make buy and sell decisions exactly as you would with real money. The key difference: there is nothing to lose.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              It is widely used by beginners who want to learn investing, experienced investors testing a new strategy, and anyone who wants to understand how the market works before committing real capital.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">Why paper trade?</h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  title: "Learn without fear",
                  body: "The biggest barrier to investing is fear — fear of making mistakes, fear of losing money. Paper trading removes that barrier entirely. You can make every mistake possible, see what happens, and learn from it without a single dollar at risk.",
                },
                {
                  title: "Understand how portfolios actually move",
                  body: "Reading about investing is one thing. Watching your simulated BHP shares drop 3% after a poor earnings report is another. Paper trading makes abstract concepts like market volatility, diversification, and compound returns concrete and personal.",
                },
                {
                  title: "Test strategies before using real money",
                  body: "Thinking about buying growth stocks? Want to try a dividend-focused portfolio? Paper trade the strategy first. If it does not perform the way you expected, you have lost nothing but a few weeks of learning.",
                },
                {
                  title: "Get familiar with how trading platforms work",
                  body: "Understanding concepts like buy price, current price, quantity, P/L, and portfolio value is much easier when you have actually used them. Investors Playground gives you a hands-on feel for these mechanics.",
                },
                {
                  title: "Build discipline and patience",
                  body: "New investors often panic-sell during dips or over-trade. Paper trading teaches you to sit with a position, watch how it moves, and make deliberate decisions rather than emotional ones.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-line bg-panel p-5" style={{ boxShadow: "var(--shadow)" }}>
                  <h3 className="text-sm font-bold text-ink mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">How to get the most out of paper trading</h2>
            <div className="flex flex-col gap-5">
              {[
                {
                  n: "1",
                  title: "Treat it like real money",
                  body: 'The most common mistake beginners make is not taking paper trading seriously because "it\'s not real". If you make reckless decisions you would never make with real money, you will not learn anything useful. Treat every simulated dollar as if it were yours.',
                },
                {
                  n: "2",
                  title: "Set a goal before you start",
                  body: "Are you trying to grow your $10,000 to $12,000 in six months? Are you testing whether you can outperform the ASX 200 index? Having a specific goal forces you to think like an investor rather than just clicking buttons.",
                },
                {
                  n: "3",
                  title: "Research before you buy",
                  body: "Do not just buy stocks you have heard of. Read the company's recent announcements, check how the stock has been performing, and form a view on why it should go up. Practice the research habit now.",
                },
                {
                  n: "4",
                  title: "Keep a trading journal",
                  body: "Write down why you made each trade and what you expected to happen. Review it after the fact. Did your thesis play out? What did you miss? A journal turns experience into learning.",
                },
                {
                  n: "5",
                  title: "Try multiple strategies",
                  body: "Use the multiple portfolios feature (available on Pro) to run different strategies simultaneously. One portfolio focused on ASX blue chips, another on high-growth US tech — compare the results over time.",
                },
                {
                  n: "6",
                  title: "Do not ignore the losses",
                  body: "When a position goes red, resist the urge to immediately sell or ignore it. Sit with it. Understand why it moved. Decide whether your original thesis still holds. This is where the real learning happens.",
                },
              ].map((item) => (
                <div key={item.n} className="flex gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-accent/10 text-accent font-extrabold text-sm flex items-center justify-center">
                    {item.n}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm font-bold text-ink mb-1">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">Common mistakes to avoid</h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  title: "Over-concentrating in one stock",
                  body: "Putting all $10,000 into one company might feel exciting, but it teaches you nothing about diversification. Try spreading across at least 4–6 different stocks or sectors.",
                },
                {
                  title: "Only picking stocks you already like",
                  body: "It is easy to buy Apple and Tesla because you know the brands. Challenge yourself to research a company you know nothing about — an ASX mining stock, a healthcare company — and form a view based on fundamentals.",
                },
                {
                  title: "Ignoring currency and exchange differences",
                  body: "ASX stocks are priced in AUD. NASDAQ stocks are priced in USD. When you hold US stocks in an AUD portfolio, currency movements affect your returns. Understanding this in simulation prepares you for the real thing.",
                },
                {
                  title: "Giving up after a loss",
                  body: "Your portfolio will go down. Markets go down. Resetting immediately after a loss means you skip the most valuable learning experience — understanding what happens when you hold through a downturn.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-bad mt-0.5 text-sm shrink-0">✕</span>
                  <div>
                    <h3 className="text-sm font-bold text-ink mb-1">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-ink mb-4">Does paper trading guarantee success with real money?</h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              No — and it is important to be honest about this. Paper trading does not replicate the psychological pressure of real money. When it is your actual savings on the line, emotions run higher, decisions are harder, and the temptation to panic-sell or over-trade is much stronger.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Paper trading is a foundation, not a guarantee. It teaches you mechanics, vocabulary, market behaviour, and basic strategy. It does not teach you how you personally react to real financial risk.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              The goal is to remove the avoidable mistakes before you invest real money — so that when you do take the leap, the only unknown is your emotional discipline, not the basic mechanics of how investing works.
            </p>
          </section>

          <div
            className="rounded-2xl border border-accent bg-panel p-8 text-center"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <h2 className="text-xl font-extrabold text-ink mb-2">Start paper trading today</h2>
            <p className="text-sm text-muted mb-6">
              Create a free account, get $10,000 in simulated cash, and start practising with live ASX and NASDAQ prices.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-accent text-white font-bold px-8 py-3 hover:opacity-90 transition"
            >
              Create Free Account
            </Link>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
