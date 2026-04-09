import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/paper-trading-guide", label: "Paper Trading" },
  { href: "/asx-vs-nasdaq", label: "ASX vs NASDAQ" },
];

export async function MarketingNav() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <nav className="border-b border-line bg-panel/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 font-bold text-ink tracking-tight">
          <span className="text-accent">●</span>
          <span className="hidden sm:inline">Investors Playground</span>
          <span className="sm:hidden">IP</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-[#f0ece3] transition"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-accent text-white font-bold text-sm px-4 py-2 hover:opacity-90 transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-ink hover:text-accent transition hidden sm:inline">
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-accent text-white font-bold text-sm px-4 py-2 hover:opacity-90 transition"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line px-6 py-8 mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
          <div>
            <div className="font-bold text-ink mb-1">
              <span className="text-accent">●</span> Investors Playground
            </div>
            <p className="text-xs text-muted max-w-xs">
              A risk-free stock market simulator using live ASX and NASDAQ prices.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide mb-1">Learn</span>
              <Link href="/how-it-works" className="text-muted hover:text-accent transition text-sm">How It Works</Link>
              <Link href="/paper-trading-guide" className="text-muted hover:text-accent transition text-sm">Paper Trading Guide</Link>
              <Link href="/asx-vs-nasdaq" className="text-muted hover:text-accent transition text-sm">ASX vs NASDAQ</Link>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-ink uppercase tracking-wide mb-1">Account</span>
              <Link href="/pricing" className="text-muted hover:text-accent transition text-sm">Pricing</Link>
              <Link href="/register" className="text-muted hover:text-accent transition text-sm">Sign Up Free</Link>
              <Link href="/login" className="text-muted hover:text-accent transition text-sm">Sign In</Link>
              <Link href="/support" className="text-muted hover:text-accent transition text-sm">Support</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-4 text-xs text-muted text-center">
          © {new Date().getFullYear()} Investors Playground. For practice purposes only — not financial advice.
        </div>
      </div>
    </footer>
  );
}
