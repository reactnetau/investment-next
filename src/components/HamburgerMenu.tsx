"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import schmappsLogo from "@/assets/schmappslogo.png";

interface Props {
  onChangePassword: () => void;
  onDeleteAccount: () => void;
  onUpgrade: () => void;
  plan: string;
}

export function HamburgerMenu({ onChangePassword, onDeleteAccount, onUpgrade, plan }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-2xl border border-white/60 bg-white/80 hover:bg-white shadow-sm transition"
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 bg-[var(--ink-strong)] rounded" />
        <span className="block w-5 h-0.5 bg-[var(--ink-strong)] rounded" />
        <span className="block w-5 h-0.5 bg-[var(--ink-strong)] rounded" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-14 w-60 bg-white/92 border border-white/60 rounded-[24px] overflow-hidden z-50 backdrop-blur-xl"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--line)] bg-[rgba(224,239,255,0.45)]">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-sm">
              <Image src={schmappsLogo} alt="Schmapps logo" className="h-8 w-8 object-contain" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">Investors Playground</p>
              <p className="text-xs text-[var(--ink-soft)]">Schmapps app family</p>
            </div>
          </div>
          {[
            { href: "/how-it-works", label: "How It Works" },
            { href: "/pricing", label: "Pricing" },
            { href: "/paper-trading-guide", label: "Paper Trading Guide" },
            { href: "/asx-vs-nasdaq", label: "ASX vs NASDAQ" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block w-full text-left px-4 py-3 text-sm text-[var(--ink-soft)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink-strong)] transition"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-[var(--line)]" />
          <button
            onClick={() => { setOpen(false); onChangePassword(); }}
            className="w-full text-left px-4 py-3 text-sm text-[var(--ink-strong)] hover:bg-[var(--surface-muted)] transition"
          >
            Change Password
          </button>
          <div className="border-t border-[var(--line)]" />
          <Link
            href="/support"
            onClick={() => setOpen(false)}
            className="block w-full text-left px-4 py-3 text-sm text-[var(--ink-strong)] hover:bg-[var(--surface-muted)] transition"
          >
            Contact Support
          </Link>
          {plan !== "pro" && (
            <>
              <div className="border-t border-[var(--line)]" />
              <button
                onClick={() => { setOpen(false); onUpgrade(); }}
                className="w-full text-left px-4 py-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--surface-muted)] transition"
              >
                Upgrade to Pro
              </button>
            </>
          )}
          <div className="border-t border-[var(--line)]" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-3 text-sm text-[var(--bad)] hover:bg-[var(--surface-muted)] transition"
          >
            Sign Out
          </button>
          <div className="border-t border-[var(--line)] mt-1" />
          <button
            onClick={() => { setOpen(false); onDeleteAccount(); }}
            className="w-full text-left px-4 py-3 text-sm text-[var(--bad)] hover:bg-[var(--surface-muted)] transition"
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
