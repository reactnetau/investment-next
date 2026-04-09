export type Currency = "aud" | "usd" | "inr";

export function formatMoney(amount: number, currency: Currency): string {
  const locales: Record<Currency, string> = { aud: "en-AU", usd: "en-US", inr: "en-IN" };
  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert an amount between currencies.
 * audUsdRate: how many USD per 1 AUD (e.g. 0.63 means 1 AUD = 0.63 USD)
 * usdInrRate: how many INR per 1 USD (e.g. 83 means 1 USD = 83 INR)
 */
export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  audUsdRate: number,
  usdInrRate = 83
): number {
  if (from === to) return amount;
  if (from === "aud" && to === "usd") return amount * audUsdRate;
  if (from === "usd" && to === "aud") return audUsdRate > 0 ? amount / audUsdRate : amount;
  if (from === "inr" && to === "usd") return usdInrRate > 0 ? amount / usdInrRate : amount;
  if (from === "usd" && to === "inr") return amount * usdInrRate;
  if (from === "inr" && to === "aud") return audUsdRate > 0 && usdInrRate > 0 ? (amount / usdInrRate) / audUsdRate : amount;
  if (from === "aud" && to === "inr") return amount * audUsdRate * usdInrRate;
  return amount;
}

/**
 * Return the appropriate starting cash amount for a given portfolio currency.
 * INR users get ₹8,00,000 (~$10,000 USD equivalent).
 */
export function startingCashForCurrency(currency: Currency): number {
  return currency === "inr" ? 800000 : 10000;
}

/**
 * Detect preferred currency from browser timezone.
 * Only available in client components.
 */
export function currencyFromTimezone(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("America/")) return "usd";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "inr";
    return "aud";
  } catch {
    return "aud";
  }
}
