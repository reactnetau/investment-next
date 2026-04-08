import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { getSiteUrl } from "@/lib/app-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Investors Playground",
  description: "Practice portfolio moves with live ASX and NASDAQ prices and a polished investing dashboard.",
  openGraph: {
    title: "Investors Playground",
    description: "Practice portfolio moves with live ASX and NASDAQ prices and a polished investing dashboard.",
    url: siteUrl,
    siteName: "Investors Playground",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Investors Playground share image",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investors Playground",
    description: "Practice portfolio moves with live ASX and NASDAQ prices and a polished investing dashboard.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
