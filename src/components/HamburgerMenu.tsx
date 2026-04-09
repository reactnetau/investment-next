"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

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
        className="flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded-xl hover:bg-line transition"
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 bg-ink rounded" />
        <span className="block w-5 h-0.5 bg-ink rounded" />
        <span className="block w-5 h-0.5 bg-ink rounded" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-52 bg-panel border border-line rounded-2xl overflow-hidden z-50"
          style={{ boxShadow: "var(--shadow)" }}
        >
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
              className="block w-full text-left px-4 py-3 text-sm text-muted hover:bg-[#f0ece3] hover:text-ink transition"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t-2 border-line" />
          <button
            onClick={() => { setOpen(false); onChangePassword(); }}
            className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-[#f0ece3] transition"
          >
            Change Password
          </button>
          <div className="border-t border-line" />
          <Link
            href="/support"
            onClick={() => setOpen(false)}
            className="block w-full text-left px-4 py-3 text-sm text-ink hover:bg-[#f0ece3] transition"
          >
            Contact Support
          </Link>
          {plan !== "pro" && (
            <>
              <div className="border-t border-line" />
              <button
                onClick={() => { setOpen(false); onUpgrade(); }}
                className="w-full text-left px-4 py-3 text-sm font-semibold text-[#8a6115] hover:bg-[#f0ece3] transition"
              >
                Upgrade to Pro
              </button>
            </>
          )}
          <div className="border-t border-line" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-4 py-3 text-sm text-bad hover:bg-[#f0ece3] transition"
          >
            Sign Out
          </button>
          <div className="border-t-2 border-line mt-1" />
          <button
            onClick={() => { setOpen(false); onDeleteAccount(); }}
            className="w-full text-left px-4 py-3 text-sm text-bad hover:bg-[#f0ece3] transition"
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
