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
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-ink mb-1">Investment Simulator</h1>
        <p className="text-muted mb-8 text-sm">Sign in to manage your portfolio.</p>

        <div className="rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
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
                className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
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
              className="rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
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
  );
}
