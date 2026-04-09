"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const TOPICS = [
  "Select a topic…",
  "I can't log in to my account",
  "A stock price isn't updating",
  "I was charged but my account isn't upgraded",
  "I can't find a stock (ASX or NASDAQ)",
"I want a refund",
  "I found a bug",
  "Other",
];

export default function SupportPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      setFromEmail(session.user.email);
    }
  }, [session?.user?.email]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, message, fromEmail, fromName }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-ink mb-1">Investment Simulator</h1>
        <p className="text-muted mb-8 text-sm">We&apos;ll get back to you as soon as possible.</p>

        <div className="rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
          <h2 className="text-lg font-bold text-ink mb-5">Contact Support</h2>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-4xl">✓</div>
              <p className="text-ink font-semibold">Message sent!</p>
              <p className="text-muted text-sm">We&apos;ve received your request and will reply to <strong>{fromEmail}</strong> shortly.</p>
              <Link
                href="/dashboard"
                className="mt-2 rounded-xl bg-accent text-white font-bold px-6 py-3 text-sm hover:opacity-90 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-bad">
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-1 text-sm text-muted">
                Topic
                <select
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t === "Select a topic…" ? "" : t} disabled={t === "Select a topic…"}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Your Name
                <input
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Jane Smith"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Your Email
                <input
                  type="email"
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  disabled={isLoggedIn}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                Message
                <textarea
                  className="rounded-xl border border-line bg-white px-3 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="Describe your issue in as much detail as possible…"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-accent text-white font-bold py-3 text-base hover:opacity-90 disabled:opacity-60 transition"
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
