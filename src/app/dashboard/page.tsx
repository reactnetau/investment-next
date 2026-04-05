"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Portfolio, Holding } from "@prisma/client";
import { PortfolioStats } from "@/components/PortfolioStats";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AddHoldingForm } from "@/components/AddHoldingForm";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { SellModal } from "@/components/SellModal";

type PortfolioWithHoldings = Portfolio & { holdings: Holding[] };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [portfolio, setPortfolio] = useState<PortfolioWithHoldings | null>(null);
  const [statusMsg, setStatusMsg] = useState("Loading portfolio…");
  const [refreshing, setRefreshing] = useState(false);
  const [selling, setSelling] = useState<string | null>(null);
  const [sellTarget, setSellTarget] = useState<Holding | null>(null);
  const [resetting, setResetting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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
        setStatusMsg(`Signed in as ${session?.user?.name ?? ""}. Portfolio loaded.`);
      });
    }
  }, [status, loadPortfolio, session]);

  async function handleRefreshPrices() {
    setRefreshing(true);
    setStatusMsg("Refreshing live prices…");
    const res = await fetch("/api/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh_prices" }),
    });
    setRefreshing(false);
    if (!res.ok) {
      setStatusMsg("Could not refresh prices right now.");
      return;
    }
    const data = await res.json();
    setPortfolio(data);
    setStatusMsg(`Refreshed live prices for ${data.holdings.length} holding(s).`);
  }

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

  if (status === "loading" || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Loading…
      </div>
    );
  }

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
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div>
          <h1 className="text-[2.1rem] font-bold text-ink tracking-wide leading-tight">
            Investment Simulator
          </h1>
          <div className="text-muted text-sm mt-1">
            Add stocks, refresh live prices from the internet, and track your total portfolio change.
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <HamburgerMenu onChangePassword={() => setShowChangePassword(true)} />
        </div>
      </div>

      {/* Status bar */}
      <div
        className="rounded-2xl border border-line bg-panel px-4 py-3 text-muted text-sm mb-4"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {statusMsg}
      </div>

      {/* Stats cards */}
      <PortfolioStats portfolio={portfolio} />

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
          />

          <h2 className="text-base font-bold text-ink mt-6 mb-3">Portfolio Actions</h2>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleRefreshPrices}
              disabled={refreshing}
              className="rounded-xl bg-[#d8a23d] text-[#2e2416] font-bold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
            >
              {refreshing ? "Refreshing…" : "Refresh Live Prices"}
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="rounded-xl bg-danger text-white font-bold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
            >
              {resetting ? "Resetting…" : "Reset Portfolio"}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted leading-relaxed">
            Starting cash is $10,000.00. Enter a stock code (ASX codes auto-append .AX),
            a buy-in price or leave blank to use the live price. Enter either a quantity
            or an AUD amount.
          </p>
        </div>

        {/* Right panel — holdings table */}
        <div
          className="rounded-[20px] border border-line bg-panel p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <h2 className="text-base font-bold text-ink mb-4">Portfolio</h2>
          <HoldingsTable
            holdings={portfolio.holdings}
            onSell={(holding) => setSellTarget(holding)}
            selling={selling}
          />
        </div>
      </div>
    </div>
  );
}
