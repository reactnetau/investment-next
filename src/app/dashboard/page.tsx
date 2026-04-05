"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Portfolio, Holding } from "@prisma/client";

type HoldingWithAge = Holding & { priceUpdatedAt: string | null };
import { PortfolioStats } from "@/components/PortfolioStats";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AddHoldingForm } from "@/components/AddHoldingForm";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { SellModal } from "@/components/SellModal";
import { FREE_HOLDING_LIMIT } from "@/lib/plans";
import { formatMoney } from "@/lib/currency";
import { PriceCountdown } from "@/components/PriceCountdown";

type PortfolioWithHoldings = Portfolio & {
  holdings: HoldingWithAge[];
  plan: string;
  currency: string;
  fxRate: number;
  nextPriceRefresh: string | null;
};

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [portfolio, setPortfolio] = useState<PortfolioWithHoldings | null>(null);
  const [statusMsg, setStatusMsg] = useState("Loading portfolio…");
  const [selling, setSelling] = useState<string | null>(null);
  const [sellTarget, setSellTarget] = useState<Holding | null>(null);
  const [resetting, setResetting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadPortfolio = useCallback(async () => {
    const res = await fetch("/api/portfolio");
    if (!res.ok) return;
    const data = await res.json();
    setPortfolio(data);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadPortfolio().then(() => {
        const upgradeParam = searchParams.get("upgrade");
        if (upgradeParam === "success") {
          setStatusMsg("You're now on Pro. Welcome to Investment Simulator Pro!");
          router.replace("/dashboard");
        } else if (upgradeParam === "cancelled") {
          setStatusMsg("Upgrade cancelled.");
          router.replace("/dashboard");
        } else {
          setStatusMsg(`Signed in as ${session?.user?.name ?? ""}. Portfolio loaded.`);
        }
      });
    }
  }, [status, loadPortfolio, session, searchParams, router]);

  async function confirmSell() {
    if (!sellTarget) return;
    const id = sellTarget.id;
    setSelling(id);
    const res = await fetch(`/api/holdings/${id}`, { method: "DELETE" });
    setSelling(null);
    setSellTarget(null);
    if (!res.ok) {
      const data = await res.json();
      setStatusMsg(data.error ?? "Failed to sell.");
      return;
    }
    const data = await res.json();
    setStatusMsg(data.message);
    loadPortfolio();
  }

  async function handleReset() {
    if (!confirm("Reset your entire portfolio? This cannot be undone.")) return;
    setResetting(true);
    const res = await fetch("/api/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setResetting(false);
    if (!res.ok) return;
    const data = await res.json();
    setPortfolio(data);
    setStatusMsg("Portfolio reset. Starting cash: $10,000.00.");
  }

  async function handleCancelSubscription() {
    if (!confirm("Cancel your Pro subscription? You'll keep access until the end of your billing period.")) return;
    const res = await fetch("/api/stripe/cancel", { method: "POST" });
    const data = await res.json();
    setStatusMsg(data.message ?? data.error ?? "Something went wrong.");
    if (res.ok) loadPortfolio();
  }

  function getUserLocale(): string {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("America/")) return "usd";
    return "aud";
  }

  async function handleUpgrade() {
    setUpgrading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: getUserLocale() }),
    });
    if (!res.ok) {
      setUpgrading(false);
      setStatusMsg("Could not start checkout. Try again.");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  const priceLabel = getUserLocale() === "usd" ? "$1.99 USD" : "$2.99 AUD";

  if (status === "loading" || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Loading…
      </div>
    );
  }

  const isFree = portfolio.plan === "free";
  const atLimit = isFree && portfolio.holdings.length >= FREE_HOLDING_LIMIT;

  return (
    <div className="w-full min-h-screen px-5 py-7 pb-12">
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      {sellTarget && (
        <SellModal
          holding={sellTarget}
          onConfirm={confirmSell}
          onClose={() => setSellTarget(null)}
          selling={selling === sellTarget.id}
          currency={(portfolio.currency ?? "aud") as "aud" | "usd"}
          fxRate={portfolio.fxRate ?? 0.65}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[2.1rem] font-bold text-ink tracking-wide leading-tight">
              Investment Simulator
            </h1>
            {portfolio.plan === "pro" && (
              <span className="rounded-lg bg-[#d8a23d] text-[#2e2416] text-xs font-bold px-2.5 py-1 tracking-wide">
                PRO
              </span>
            )}
          </div>
          <div className="text-muted text-sm mt-1">
            Add stocks, refresh live prices from the internet, and track your total portfolio change. Supports ASX and NASDAQ.
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <HamburgerMenu
            onChangePassword={() => setShowChangePassword(true)}
            onCancelSubscription={handleCancelSubscription}
            onUpgrade={handleUpgrade}
            plan={portfolio.plan}
          />
        </div>
      </div>

      {/* Upgrade banner — shown when free user hits the limit */}
      {atLimit && (
        <div
          className="rounded-2xl border border-[#d8a23d] bg-[#fffbf0] px-4 py-3 mb-4 flex items-center justify-between gap-4"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div>
            <span className="text-sm font-bold text-ink">You've reached the free limit of {FREE_HOLDING_LIMIT} stocks.</span>
            <span className="text-sm text-muted ml-2">Upgrade to Pro to add unlimited stocks.</span>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="shrink-0 rounded-xl bg-[#d8a23d] text-[#2e2416] font-bold px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60 transition"
          >
            {upgrading ? "Redirecting…" : `Upgrade to Pro — ${priceLabel}/mo`}
          </button>
        </div>
      )}

      {/* Status bar */}
      <div
        className="rounded-2xl border border-line bg-panel px-4 py-3 text-muted text-sm mb-4"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {statusMsg}
      </div>

      {/* Stats cards */}
      <PortfolioStats
        portfolio={portfolio}
        currency={(portfolio.currency ?? "aud") as "aud" | "usd"}
        fxRate={portfolio.fxRate ?? 0.65}
      />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
        {/* Left panel */}
        <div
          className="rounded-[20px] border border-line bg-panel p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <h2 className="text-base font-bold text-ink mb-4">Add Investment</h2>

          <AddHoldingForm
            onAdded={() => loadPortfolio()}
            onStatus={(msg) => setStatusMsg(msg)}
            onUpgradeRequired={handleUpgrade}
          />

          <h2 className="text-base font-bold text-ink mt-6 mb-3">Portfolio Actions</h2>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="rounded-xl bg-danger text-white font-bold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
            >
              {resetting ? "Resetting…" : "Reset Portfolio"}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted leading-relaxed">
            Starting cash is {formatMoney(10000, (portfolio.currency ?? "aud") as "aud" | "usd")}. Enter an ASX code (e.g. BHP) or NASDAQ/NYSE code (e.g. META, AAPL).
            Leave the buy-in price blank to use the live price. All values shown in {(portfolio.currency ?? "AUD").toUpperCase()}.
            {isFree && (
              <span className="block mt-1">Free accounts can hold up to {FREE_HOLDING_LIMIT} stocks. <button onClick={handleUpgrade} className="text-accent underline">Upgrade to Pro</button> for unlimited.</span>
            )}
          </p>
        </div>

        {/* Right panel — holdings table */}
        <div
          className="rounded-[20px] border border-line bg-panel p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-ink">Portfolio</h2>
            <div className="flex items-center gap-3">
              <PriceCountdown nextRefresh={portfolio.nextPriceRefresh} />
              {isFree && (
                <span className="text-xs text-muted">{portfolio.holdings.length} / {FREE_HOLDING_LIMIT} stocks</span>
              )}
            </div>
          </div>
          <HoldingsTable
            holdings={portfolio.holdings}
            onSell={(holding) => setSellTarget(holding)}
            selling={selling}
            currency={(portfolio.currency ?? "aud") as "aud" | "usd"}
            fxRate={portfolio.fxRate ?? 0.65}
          />
        </div>
      </div>
    </div>
  );
}
