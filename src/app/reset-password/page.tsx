"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/login?reset=1");
  }

  if (!token) {
    return (
      <div className="text-sm text-bad">Invalid or missing reset token. Please request a new reset link.</div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-muted">
          New Password
          <input
            type="password"
            className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
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

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? "Saving…" : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-ink mb-1">Investment Simulator</h1>
        <p className="text-muted mb-8 text-sm">Choose a new password.</p>

        <div className="rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
          <h2 className="text-lg font-bold text-ink mb-5">Reset Password</h2>
          <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
