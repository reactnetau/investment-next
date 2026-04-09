import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { NotistackProvider } from "@/components/NotistackProvider";
import { getSiteUrl } from "@/lib/app-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Investors Playground — Practice Investing with Live ASX & NASDAQ Prices",
    template: "%s — Investors Playground",
  },
  description:
    "Build investing confidence before you risk real money. Practice with live ASX and NASDAQ prices, track your portfolio, and learn the markets risk-free.",
  keywords: [
    "investment simulator",
    "stock market simulator",
    "ASX simulator",
    "NASDAQ simulator",
    "practice investing",
    "portfolio tracker",
    "learn investing",
    "risk-free investing",
    "stock trading simulator",
    "ASX stocks",
    "paper trading",
  ],
  authors: [{ name: "Investors Playground" }],
  creator: "Investors Playground",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Investors Playground — Practice Investing with Live ASX & NASDAQ Prices",
    description:
      "Build investing confidence before you risk real money. Practice with live ASX and NASDAQ prices, track your portfolio, and learn the markets risk-free.",
    url: siteUrl,
    siteName: "Investors Playground",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Investors Playground — practice investing with live ASX and NASDAQ prices",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investors Playground — Practice Investing with Live ASX & NASDAQ Prices",
    description:
      "Build investing confidence before you risk real money. Practice with live ASX and NASDAQ prices, track your portfolio, and learn the markets risk-free.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NotistackProvider>{children}</NotistackProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
