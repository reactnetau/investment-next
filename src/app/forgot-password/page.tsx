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
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-ink mb-1">Investment Simulator</h1>
        <p className="text-muted mb-8 text-sm">Reset your password.</p>

        <div className="rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
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
                    className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
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
