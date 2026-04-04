"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        className="relative w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <h2 className="text-lg font-bold text-ink mb-5">Change Password</h2>

        {success ? (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-good font-medium">Password changed successfully.</div>
            <button
              onClick={onClose}
              className="rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-muted">
                Current Password
                <input
                  type="password"
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                New Password
                <input
                  type="password"
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Confirm New Password
                <input
                  type="password"
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-line bg-white py-3 text-ink font-bold text-base hover:bg-[#f0ece3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
