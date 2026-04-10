"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSnackbar } from "notistack";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Portfolio, Holding } from "@prisma/client";

type HoldingWithAge = Holding & { priceUpdatedAt: string | null };
import { PortfolioStats } from "@/components/PortfolioStats";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AddHoldingForm } from "@/components/AddHoldingForm";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { SellModal } from "@/components/SellModal";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FREE_HOLDING_LIMIT } from "@/lib/plans";
import { formatMoney } from "@/lib/currency";
import { PriceCountdown } from "@/components/PriceCountdown";
import { UpgradeModal } from "@/components/UpgradeModal";
import schmappsLogo from "@/assets/schmappslogo.png";

type PortfolioWithHoldings = Portfolio & {
  holdings: HoldingWithAge[];
  plan: string;
  currency: string;
  fxRate: number;
  usdInrRate: number;
  nextPriceRefresh: string | null;
};

interface ProfileSummary {
  id: string;
  name: string;
  holdingCount: number;
  isActive: boolean;
  currency: string;
}

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

  const { enqueueSnackbar } = useSnackbar();
  const [portfolio, setPortfolio] = useState<PortfolioWithHoldings | null>(null);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selling, setSelling] = useState<string | null>(null);
  const [sellTarget, setSellTarget] = useState<Holding | null>(null);
  const [resetting, setResetting] = useState(false);
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  async function handleRefreshPrices() {
    setRefreshingPrices(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh_prices" }),
      });
      if (!res.ok) {
        const data = await res.json();
        enqueueSnackbar(data.error ?? "Failed to refresh prices.", { variant: "error" });
        return;
      }
      const data = await res.json();
      setPortfolio(data);
      enqueueSnackbar("Live prices updated!", { variant: "success" });
    } catch {
      enqueueSnackbar("Could not reach the server. Please try again.", { variant: "error" });
    } finally {
      setRefreshingPrices(false);
    }
  }

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCancelSubConfirm, setShowCancelSubConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const loadProfiles = useCallback(async () => {
    const res = await fetch("/api/profiles");
    if (!res.ok) return;
    const data = await res.json();
    setProfiles(data.profiles ?? []);
  }, []);

  const loadPortfolio = useCallback(async () => {
    const res = await fetch("/api/portfolio");
    if (!res.ok) return;
    const data = await res.json();
    setPortfolio(data);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadPortfolio(), loadProfiles()]);
  }, [loadPortfolio, loadProfiles]);

  useEffect(() => {
    if (status === "authenticated") {
      loadAll().then(async () => {
        const upgradeParam = searchParams.get("upgrade");
        if (upgradeParam === "success") {
          const sessionId = searchParams.get("session_id");
          if (sessionId) {
            await fetch("/api/stripe/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            });
            await loadAll();
          }
          enqueueSnackbar("You're now on Pro. Welcome to Investment Simulator Pro!", { variant: "success" });
          router.replace("/dashboard");
        } else if (upgradeParam === "cancelled") {
          enqueueSnackbar("Upgrade cancelled.", { variant: "info" });
          router.replace("/dashboard");
        } else {
          enqueueSnackbar(`Signed in as ${session?.user?.name ?? ""}. Portfolio loaded.`, { variant: "success" });
        }
      });
    }
  }, [status, loadAll, session, searchParams, router]);

  async function confirmSell() {
    if (!sellTarget) return;
    const id = sellTarget.id;
    setSelling(id);
    const res = await fetch(`/api/holdings/${id}`, { method: "DELETE" });
    setSelling(null);
    setSellTarget(null);
    if (!res.ok) {
      const data = await res.json();
      enqueueSnackbar(data.error ?? "Failed to sell.", { variant: "error" });
      return;
    }
    const data = await res.json();
    enqueueSnackbar(data.message, { variant: "success" });
    loadPortfolio();
  }

  async function confirmReset() {
    setShowResetConfirm(false);
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
    const resetAmount = formatMoney(data.cash, (data.currency ?? "aud") as "aud" | "usd" | "inr");
    enqueueSnackbar(`Portfolio reset. Starting cash: ${resetAmount}.`, { variant: "success" });
    loadProfiles();
  }

  async function confirmCancelSubscription() {
    setShowCancelSubConfirm(false);
    const res = await fetch("/api/stripe/cancel", { method: "POST" });
    const data = await res.json();
    enqueueSnackbar(data.message ?? data.error ?? "Something went wrong.", { variant: res.ok ? "success" : "error" });
    if (res.ok) loadAll();
  }

  async function confirmDeleteAccount() {
    setDeletingAccount(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    const data = await res.json();
    setDeletingAccount(false);
    setShowDeleteAccount(false);
    enqueueSnackbar(data.message ?? data.error ?? "Something went wrong.", { variant: res.ok ? "success" : "error" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    }
  }

  function getUserLocale(): string {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("America/")) return "usd";
    return "aud";
  }

  const priceLabel = getUserLocale() === "usd" ? "$3.00 USD" : "$5.00 AUD";

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
    <div className="theme-shell w-full px-5 py-7 pb-12">
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          onConfirm={confirmDeleteAccount}
          onClose={() => setShowDeleteAccount(false)}
          deleting={deletingAccount}
          isPro={portfolio?.plan === "pro"}
        />
      )}

      {showResetConfirm && (
        <ConfirmModal
          title="Reset Portfolio"
          message={`Reset "${profiles.find((p) => p.isActive)?.name ?? "this portfolio"}"? This cannot be undone.`}
          confirmLabel="Reset"
          danger
          loading={resetting}
          onConfirm={confirmReset}
          onClose={() => setShowResetConfirm(false)}
        />
      )}

      {showCancelSubConfirm && (
        <ConfirmModal
          title="Cancel Subscription"
          message="Cancel your Pro subscription? You'll keep access until the end of your billing period."
          confirmLabel="Cancel Subscription"
          onConfirm={confirmCancelSubscription}
          onClose={() => setShowCancelSubConfirm(false)}
        />
      )}

      {sellTarget && (
        <SellModal
          holding={sellTarget}
          onConfirm={confirmSell}
          onClose={() => setSellTarget(null)}
          selling={selling === sellTarget.id}
          currency={(portfolio.currency ?? "aud") as "aud" | "usd" | "inr"}
          fxRate={portfolio.fxRate ?? 0.65}
          usdInrRate={portfolio.usdInrRate ?? 83}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-3 rounded-[28px] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_12px_24px_rgba(34,197,94,0.14)]">
              <Image src={schmappsLogo} alt="Schmapps logo" className="h-9 w-9 object-contain" priority />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-muted)]">Schmapps</p>
              <p className="text-sm font-semibold text-[var(--ink-strong)]">Investors Playground</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[2.1rem] font-bold text-[var(--ink-strong)] tracking-wide leading-tight">
              Investment Simulator
            </h1>
            {portfolio.plan === "pro" && (
              <span className="rounded-full bg-[rgba(224,239,255,0.8)] text-blue-700 text-xs font-bold px-3 py-1 tracking-wide">
                PRO
              </span>
            )}
          </div>
          <div className="text-[var(--ink-soft)] text-sm mt-1 max-w-3xl">
            Add stocks, refresh live prices from the internet, and track your total portfolio change. Supports ASX, NASDAQ, NSE and BSE.
          </div>
          {profiles.length > 0 && (
            <div className="mt-3">
              <ProfileSwitcher
                profiles={profiles}
                plan={portfolio.plan}
                onSwitch={async () => {
                  await loadAll();
                  enqueueSnackbar("Portfolio loaded.", { variant: "success" });
                }}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <HamburgerMenu
            onChangePassword={() => setShowChangePassword(true)}
            onDeleteAccount={() => setShowDeleteAccount(true)}
            onUpgrade={() => setShowUpgradeModal(true)}
            plan={portfolio.plan}
          />
        </div>
      </div>

      {/* Upgrade banner — shown when free user hits the limit */}
      {atLimit && (
        <div
          className="rounded-3xl border border-[rgba(34,197,94,0.28)] bg-white/92 px-4 py-4 mb-4 flex items-center justify-between gap-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div>
            <span className="text-sm font-bold text-[var(--ink-strong)]">You've reached the free limit of {FREE_HOLDING_LIMIT} stocks.</span>
            <span className="text-sm text-[var(--ink-soft)] ml-2">Unlock unlimited stocks with a one-off payment.</span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="theme-button-primary shrink-0 px-4 py-2 text-sm"
          >
            Unlock Pro — One-off {priceLabel}
          </button>
        </div>
      )}

      {/* Stats cards */}
      <PortfolioStats
        portfolio={portfolio}
        currency={(portfolio.currency ?? "aud") as "aud" | "usd" | "inr"}
        fxRate={portfolio.fxRate ?? 0.65}
        usdInrRate={portfolio.usdInrRate ?? 83}
      />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
        {/* Left panel */}
        <div
          className="theme-panel p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <h2 className="text-base font-bold text-[var(--ink-strong)] mb-4">Add Investment</h2>

          <AddHoldingForm
            key={portfolio.id}
            onAdded={() => {
              loadPortfolio();
              loadProfiles();
            }}
            onUpgradeRequired={() => setShowUpgradeModal(true)}
          />

          <h2 className="text-base font-bold text-[var(--ink-strong)] mt-6 mb-3">Portfolio Actions</h2>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={resetting}
              className="rounded-2xl bg-[var(--danger)] text-white font-bold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
            >
              {resetting ? "Resetting…" : "Reset Portfolio"}
            </button>
          </div>

          <p className="mt-4 text-xs text-[var(--ink-soft)] leading-relaxed">
            Starting cash is {formatMoney(portfolio.currency === "inr" ? 800000 : 10000, (portfolio.currency ?? "aud") as "aud" | "usd" | "inr")}. Enter an ASX code (e.g. BHP), NASDAQ/NYSE code (e.g. META, AAPL), or Indian stock with suffix (e.g. RELIANCE.NS, TCS.BO).
            Leave the buy-in price blank to use the live price. All values shown in {(portfolio.currency ?? "AUD").toUpperCase()}.
            {isFree && (
              <span className="block mt-1">Free accounts can hold up to {FREE_HOLDING_LIMIT} stocks. <button onClick={() => setShowUpgradeModal(true)} className="text-[var(--accent)] underline">Unlock unlimited with a one-off payment</button>.</span>
            )}
          </p>
        </div>

        {/* Right panel — holdings table */}
        <div
          className="theme-panel p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-[var(--ink-strong)]">Portfolio</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshPrices}
                disabled={refreshingPrices}
                className="theme-button-primary px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs disabled:opacity-60"
                title="Fetch the latest prices for your holdings from Yahoo Finance"
              >
                {refreshingPrices ? "Updating…" : "Update Live Prices"}
              </button>
              <PriceCountdown nextRefresh={portfolio.nextPriceRefresh} onRefreshDue={loadPortfolio} />
              {isFree && (
                <span className="text-xs text-[var(--ink-soft)]">{portfolio.holdings.length} / {FREE_HOLDING_LIMIT} stocks</span>
              )}
            </div>
          </div>
          <HoldingsTable
            holdings={portfolio.holdings}
            onSell={(holding) => setSellTarget(holding)}
            selling={selling}
            currency={(portfolio.currency ?? "aud") as "aud" | "usd" | "inr"}
            fxRate={portfolio.fxRate ?? 0.65}
            usdInrRate={portfolio.usdInrRate ?? 83}
          />
        </div>
      </div>
    </div>
  );
}
