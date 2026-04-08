"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { currencyFromTimezone } from "@/lib/currency";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
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
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
        currency: currencyFromTimezone(),
        profileName: profileName.trim() || "My Portfolio",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: email.trim(), password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-ink mb-1">Investment Simulator</h1>
        <p className="text-muted mb-8 text-sm">Create an account to get started.</p>

        <div className="rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
          <h2 className="text-lg font-bold text-ink mb-5">Create Account</h2>

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
              Portfolio Name
              <input
                type="text"
                className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="My Portfolio"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                maxLength={40}
              />
              <span className="text-xs text-muted mt-0.5">You can create more portfolios after signing up.</span>
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

            <label className="flex flex-col gap-1 text-sm text-muted">
              Confirm Password
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
              className="mt-1 rounded-xl bg-accent py-3 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
