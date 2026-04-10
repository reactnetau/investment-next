"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    setLoading(false);

    const data = await res.json();

    // TODO: remove debug error detail before launch
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="theme-panel mx-auto w-full max-w-md px-6 py-7 sm:px-8 sm:py-9">
        <h1 className="text-3xl font-bold text-[var(--ink-strong)] mb-1">Investment Simulator</h1>
        <p className="text-[var(--ink-soft)] mb-8 text-sm">Reset your password.</p>

        <div className="theme-card p-6 bg-white/95">
          <h2 className="text-lg font-bold text-ink mb-5">Forgot Password</h2>

          {sent ? (
            <div className="text-sm text-muted leading-relaxed">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox.
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
                  Email address
                  <input
                    type="email"
                    className="theme-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="theme-button-primary w-full disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
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
