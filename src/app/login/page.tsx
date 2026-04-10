"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block px-4">
          <p className="theme-kicker mb-5">Welcome back</p>
          <h1 className="text-5xl font-bold tracking-tight text-[var(--ink-strong)] leading-tight">Sign in and keep practising with a clear view of your portfolio.</h1>
          <p className="mt-5 max-w-lg text-base text-[var(--ink-soft)]">Live prices, clean portfolio tracking, and a calmer investing workspace without real-money pressure.</p>
        </div>

        <div className="theme-panel w-full max-w-md justify-self-center px-6 py-7 sm:px-8 sm:py-9">
        <h1 className="text-3xl font-bold text-[var(--ink-strong)] mb-1">Investment Simulator</h1>
        <p className="text-[var(--ink-soft)] mb-8 text-sm">Sign in to manage your portfolio.</p>

        <div className="theme-card p-6 bg-white/95">
          <h2 className="text-lg font-bold text-ink mb-5">Sign In</h2>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Email
              <input
                type="email"
                className="theme-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted">
              Password
              <input
                type="password"
                className="theme-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="text-right -mt-1">
              <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary w-full disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/register" className="text-accent font-semibold hover:underline">
            Create one
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
