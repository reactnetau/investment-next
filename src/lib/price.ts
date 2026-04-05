import { db } from "@/lib/db";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

async function fetchSymbol(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose ?? null;
    return price && price > 0 ? price : null;
  } catch {
    return null;
  }
}

/**
 * Fetch live price from Yahoo Finance.
 * Tries ASX (.AX) first for codes without a dot, falls back to bare code (NASDAQ/NYSE).
 */
export async function fetchLivePrice(code: string): Promise<number | null> {
  const s = code.trim().toUpperCase();
  if (s.includes(".")) return fetchSymbol(s);
  const asx = await fetchSymbol(`${s}.AX`);
  if (asx !== null) return asx;
  return fetchSymbol(s);
}

/**
 * Get price from cache. If not cached, fetch from Yahoo and save to cache.
 * Returns null if price cannot be determined.
 */
export async function getCachedPrice(code: string): Promise<number | null> {
  const s = code.trim().toUpperCase();

  const cached = await db.price.findUnique({ where: { code: s } });
  if (cached) return cached.price;

  // Not in cache — fetch live and save
  const price = await fetchLivePrice(s);
  if (price !== null) {
    await db.price.upsert({
      where: { code: s },
      update: { price },
      create: { code: s, price },
    });
  }
  return price;
}

/**
 * Refresh all cached prices from Yahoo. Called by the cron job.
 */
export async function refreshAllCachedPrices(): Promise<{ updated: number; failed: number }> {
  const codes = await db.price.findMany({ select: { code: true } });
  let updated = 0;
  let failed = 0;

  await Promise.all(
    codes.map(async ({ code }) => {
      const price = await fetchLivePrice(code);
      if (price !== null) {
        await db.price.update({ where: { code }, data: { price } });
        updated++;
      } else {
        failed++;
      }
    })
  );

  return { updated, failed };
}
