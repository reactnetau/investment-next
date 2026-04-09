import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/register", "/login", "/support"],
        disallow: ["/dashboard", "/api/", "/reset-password", "/forgot-password"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
