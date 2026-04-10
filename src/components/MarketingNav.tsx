"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import schmappsLogo from "@/assets/schmappslogo.png";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/paper-trading-guide", label: "Paper Trading" },
  { href: "/asx-vs-nasdaq", label: "ASX vs NASDAQ" },
];

export function MarketingNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;

  return (
    <nav className="sticky top-0 z-40 border-b border-white/50 bg-white/72 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 font-bold text-[var(--ink-strong)] tracking-tight hover:opacity-80 transition">
          <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_12px_24px_rgba(34,197,94,0.18)]">
            <Image src={schmappsLogo} alt="Schmapps logo" className="h-8 w-8 object-contain" priority />
          </span>
          <span className="hidden sm:inline">Investors Playground</span>
          <span className="sm:hidden font-bold text-[var(--ink-strong)]">IP</span>
        </Link>

        {/* Page links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-2xl text-sm transition ${
                pathname === l.href
                  ? "bg-[rgba(224,239,255,0.75)] text-[var(--ink-strong)] font-semibold"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink-strong)] hover:bg-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="theme-button-primary px-4 py-2"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--ink-strong)] hover:text-[var(--accent)] transition hidden sm:inline"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="theme-button-primary px-4 py-2"
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
    <footer className="border-t border-white/50 px-6 py-8 mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
          <div>
            <div className="font-bold text-[var(--ink-strong)] mb-1 inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_10px_20px_rgba(34,197,94,0.18)]">
                <Image src={schmappsLogo} alt="Schmapps logo" className="h-6 w-6 object-contain" />
              </span>
              Investors Playground
            </div>
            <p className="text-xs text-[var(--ink-soft)] max-w-xs">
              A risk-free stock market simulator using live ASX and NASDAQ prices.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--ink-strong)] uppercase tracking-wide mb-1">Learn</span>
              <Link href="/how-it-works" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">How It Works</Link>
              <Link href="/paper-trading-guide" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">Paper Trading Guide</Link>
              <Link href="/asx-vs-nasdaq" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">ASX vs NASDAQ</Link>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--ink-strong)] uppercase tracking-wide mb-1">Account</span>
              <Link href="/pricing" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">Pricing</Link>
              <Link href="/register" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">Sign Up Free</Link>
              <Link href="/login" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">Sign In</Link>
              <Link href="/support" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition text-sm">Support</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--line)] pt-4 text-xs text-[var(--ink-soft)] text-center">
          © {new Date().getFullYear()} Investors Playground. For practice purposes only — not financial advice.
        </div>
      </div>
    </footer>
  );
}
