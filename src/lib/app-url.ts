const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_SITE_URL = "https://www.investorsplayground.com";

function normalizeUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  const unquoted =
    trimmed && ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  if (!unquoted) return fallback;

  try {
    const normalized = new URL(unquoted);
    normalized.pathname = normalized.pathname.replace(/\/+$/, "");
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getAppUrl(): string {
  return normalizeUrl(process.env.NEXTAUTH_URL, DEFAULT_APP_URL);
}

export function getSiteUrl(): string {
  return normalizeUrl(process.env.NEXTAUTH_URL, DEFAULT_SITE_URL);
}
