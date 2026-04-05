export type Currency = "aud" | "usd";

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "usd" ? "en-US" : "en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert an amount between currencies.
 * audUsdRate: how many USD per 1 AUD (e.g. 0.63 means 1 AUD = 0.63 USD)
 */
export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  audUsdRate: number
): number {
  if (from === to || audUsdRate <= 0) return amount;
  if (from === "aud" && to === "usd") return amount * audUsdRate;
  return amount / audUsdRate; // usd → aud
}

/**
 * Detect preferred currency from browser timezone.
 * Only available in client components.
 */
export function currencyFromTimezone(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return tz.startsWith("America/") ? "usd" : "aud";
  } catch {
    return "aud";
  }
}
