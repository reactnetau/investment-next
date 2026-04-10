"use client";

import { useState, useRef, useEffect } from "react";
import { AddProfileModal } from "@/components/AddProfileModal";
import { ConfirmModal } from "@/components/ConfirmModal";

interface Profile {
  id: string;
  name: string;
  holdingCount: number;
  isActive: boolean;
  currency: string;
}

interface Props {
  profiles: Profile[];
  plan: string;
  onSwitch: () => void;
  onUpgrade: () => void;
}

export function ProfileSwitcher({ profiles, plan, onSwitch, onUpgrade }: Props) {
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const activeProfile = profiles.find((p) => p.isActive);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setRenamingId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  async function handleSwitch(profileId: string) {
    if (switching) return;
    setSwitching(profileId);
    try {
      await fetch("/api/profiles/switch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      setOpen(false);
      onSwitch();
    } finally {
      setSwitching(null);
    }
  }

  async function handleDelete(profileId: string) {
    setDeletingId(profileId);
    try {
      await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      setConfirmDeleteId(null);
      onSwitch();
    } finally {
      setDeletingId(null);
    }
  }

  function startRename(profile: Profile) {
    setRenamingId(profile.id);
    setRenameValue(profile.name);
  }

  async function submitRename(profileId: string) {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    setRenameSaving(true);
    try {
      await fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      setRenamingId(null);
      onSwitch(); // Reload to reflect new name
    } finally {
      setRenameSaving(false);
    }
  }

  const confirmDeleteTarget = profiles.find((p) => p.id === confirmDeleteId);

  return (
    <>
      {showAddModal && (
        <AddProfileModal
          onCreated={async (newId) => {
            setShowAddModal(false);
            await fetch("/api/profiles/switch", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profileId: newId }),
            });
            onSwitch();
          }}
          onClose={() => setShowAddModal(false)}
          onUpgradeRequired={onUpgrade}
        />
      )}

      {confirmDeleteId && confirmDeleteTarget && (
        <ConfirmModal
          title="Delete Portfolio"
          message={`Delete "${confirmDeleteTarget.name}"? This will permanently remove all ${confirmDeleteTarget.holdingCount} holding${confirmDeleteTarget.holdingCount !== 1 ? "s" : ""} in this portfolio.`}
          confirmLabel="Delete"
          danger
          loading={deletingId === confirmDeleteId}
          onConfirm={() => handleDelete(confirmDeleteId)}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="relative" ref={ref}>
        <button
          onClick={() => { setOpen((v) => !v); setRenamingId(null); }}
          className="flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/88 px-3 py-2 text-sm text-[var(--ink-strong)] hover:bg-white transition max-w-[220px]"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <span className="truncate font-medium">{activeProfile?.name ?? "Portfolio"}</span>
          <svg
            className={`w-3.5 h-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute left-0 top-12 w-80 bg-white/94 border border-white/60 rounded-[24px] overflow-hidden z-50 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs text-[var(--ink-muted)] font-medium uppercase tracking-wide px-1 mb-1">Your Portfolios</p>
            </div>

            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center gap-1 px-3 py-2 hover:bg-[var(--surface-muted)] transition ${
                  profile.isActive ? "bg-[rgba(224,239,255,0.55)]" : ""
                }`}
              >
                {renamingId === profile.id ? (
                  // Inline rename input
                  <form
                    className="flex-1 flex items-center gap-1.5"
                    onSubmit={(e) => { e.preventDefault(); submitRename(profile.id); }}
                  >
                    <input
                      ref={renameInputRef}
                      className="flex-1 rounded-xl border border-[var(--accent)] bg-white px-3 py-2 text-sm text-[var(--ink-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      maxLength={40}
                      disabled={renameSaving}
                      onKeyDown={(e) => { if (e.key === "Escape") setRenamingId(null); }}
                    />
                    <button
                      type="submit"
                      disabled={renameSaving || !renameValue.trim()}
                      className="shrink-0 rounded-xl bg-[var(--accent)] px-3 py-2 text-xs text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {renameSaving ? "…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      className="shrink-0 rounded-xl border border-[var(--line)] px-3 py-2 text-xs text-[var(--ink-soft)] hover:bg-[var(--surface-muted)] transition"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => !profile.isActive && handleSwitch(profile.id)}
                      disabled={profile.isActive || switching === profile.id}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {profile.isActive && (
                          <svg className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span className={`text-sm truncate ${profile.isActive ? "font-semibold text-[var(--ink-strong)]" : "text-[var(--ink-strong)]"}`}>
                          {switching === profile.id ? "Switching…" : profile.name}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ink-soft)] mt-0.5" style={{ marginLeft: profile.isActive ? "1.375rem" : "0" }}>
                        {profile.holdingCount} holding{profile.holdingCount !== 1 ? "s" : ""} · {profile.currency.toUpperCase()}
                      </p>
                    </button>

                    {/* Rename button */}
                    <button
                      onClick={() => startRename(profile)}
                      className="shrink-0 p-1.5 rounded-xl text-[var(--ink-soft)] hover:text-[var(--accent)] hover:bg-[var(--surface-muted)] transition"
                      title="Rename portfolio"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    {profiles.length > 1 && (
                      <button
                        onClick={() => setConfirmDeleteId(profile.id)}
                        className="shrink-0 p-1.5 rounded-xl text-[var(--ink-soft)] hover:text-[var(--bad)] hover:bg-red-50 transition"
                        title="Delete portfolio"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}

            <div className="border-t border-[var(--line)] mt-1" />

            <button
              onClick={() => {
                setOpen(false);
                if (plan === "free" && profiles.length >= 1) {
                  onUpgrade();
                } else {
                  setShowAddModal(true);
                }
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--accent)] font-semibold hover:bg-[var(--surface-muted)] transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {plan === "free" ? "Add Portfolio (Pro)" : "Add Portfolio"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
