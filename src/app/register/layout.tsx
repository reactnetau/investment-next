import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account",
  description:
    "Sign up for free and start practising stock investing with live ASX, NASDAQ, NSE and BSE prices. No real money, no real risk — build your confidence first.",
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
