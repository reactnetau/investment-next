"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface Props {
  onChangePassword: () => void;
  onCancelSubscription: () => void;
  plan: string;
}

export function HamburgerMenu({ onChangePassword, onCancelSubscription, plan }: Props) {
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
          <button
            onClick={() => { setOpen(false); onChangePassword(); }}
            className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-[#f0ece3] transition"
          >
            Change Password
          </button>
          {plan === "pro" && (
            <>
              <div className="border-t border-line" />
              <button
                onClick={() => { setOpen(false); onCancelSubscription(); }}
                className="w-full text-left px-4 py-3 text-sm text-muted hover:bg-[#f0ece3] transition"
              >
                Cancel Subscription
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
        </div>
      )}
    </div>
  );
}
