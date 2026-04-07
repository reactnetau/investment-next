import { db } from "@/lib/db";
import type { Currency } from "@/lib/currency";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

const FETCH_TIMEOUT_MS = 8000;
const QUOTE_BATCH_SIZE = 50;
const MAX_QUOTE_URL_LENGTH = 1800;

type YahooQuote = {
  symbol?: string;
  regularMarketPrice?: number | null;
  regularMarketPreviousClose?: number | null;
  currency?: string | null;
};

function getFetchOptions() {
  return {
    headers: HEADERS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store" as RequestCache,
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildQuoteUrl(symbols: string[]): string {
  return `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.map(encodeURIComponent).join(",")}`;
}

function getQuotePrice(quote: YahooQuote | null | undefined): number | null {
  const price = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose ?? null;
  return price && price > 0 ? price : null;
}

async function fetchQuoteMap(symbols: string[]): Promise<Map<string, YahooQuote>> {
  const uniqueSymbols = [...new Set(symbols.filter(Boolean))];
  const result = new Map<string, YahooQuote>();

  async function loadBatch(batch: string[]) {
    try {
      const res = await fetch(buildQuoteUrl(batch), getFetchOptions());
      if (!res.ok) return;

      const data = await res.json();
      const quotes = data?.quoteResponse?.result;
      if (!Array.isArray(quotes)) return;

      for (const quote of quotes as YahooQuote[]) {
        if (quote?.symbol) {
          result.set(quote.symbol, quote);
        }
      }
    } catch {
      // Treat this batch as failed and let callers fall back to null results.
    }
  }

  if (uniqueSymbols.length === 0) {
    return result;
  }

  const singleUrl = buildQuoteUrl(uniqueSymbols);
  if (singleUrl.length <= MAX_QUOTE_URL_LENGTH) {
    await loadBatch(uniqueSymbols);
    return result;
  }

  await Promise.all(chunk(uniqueSymbols, QUOTE_BATCH_SIZE).map(loadBatch));

  return result;
}

async function fetchSymbol(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, getFetchOptions());
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
 * Returns the price and its native currency.
 * - ASX stocks (.AX) → AUD
 * - NASDAQ/NYSE (bare code) → USD
 */
export async function fetchLivePrice(code: string): Promise<{ price: number; currency: Currency } | null> {
  const s = code.trim().toUpperCase();

  if (s.includes(".")) {
    const quotes = await fetchQuoteMap([s]);
    const price = getQuotePrice(quotes.get(s)) ?? await fetchSymbol(s);
    if (price === null) return null;
    const currency: Currency = s.endsWith(".AX") ? "aud" : "usd";
    return { price, currency };
  }

  // Try ASX first (AUD), fall back to NASDAQ/NYSE (USD)
  const quotes = await fetchQuoteMap([`${s}.AX`, s]);
  const axPrice = getQuotePrice(quotes.get(`${s}.AX`)) ?? await fetchSymbol(`${s}.AX`);
  if (axPrice !== null) return { price: axPrice, currency: "aud" };

  const usPrice = getQuotePrice(quotes.get(s)) ?? await fetchSymbol(s);
  if (usPrice !== null) return { price: usPrice, currency: "usd" };

  return null;
}

/**
 * Get price from cache. Falls back to Yahoo and saves to cache if not found.
 */
export async function getCachedPrice(code: string): Promise<{ price: number; currency: Currency } | null> {
  const s = code.trim().toUpperCase();

  const cached = await db.price.findUnique({ where: { code: s } });
  if (cached) return { price: cached.price, currency: cached.currency as Currency };

  const result = await fetchLivePrice(s);
  if (result !== null) {
    await db.price.upsert({
      where: { code: s },
      update: { price: result.price, currency: result.currency },
      create: { code: s, price: result.price, currency: result.currency },
    });
  }
  return result;
}

/**
 * Get the current AUDUSD rate from cache. Falls back to Yahoo if not cached.
 * Returns how many USD per 1 AUD (e.g. 0.63).
 */
export async function getAudUsdRate(): Promise<number> {
  const cached = await db.price.findUnique({ where: { code: "AUDUSD" } });
  if (cached) return cached.price;

  const price = await fetchSymbol("AUDUSD=X");
  const rate = price ?? 0.65; // fallback to rough estimate

  await db.price.upsert({
    where: { code: "AUDUSD" },
    update: { price: rate, currency: "usd" },
    create: { code: "AUDUSD", price: rate, currency: "usd" },
  });

  return rate;
}

/**
 * Refresh all cached prices from Yahoo. Called by the cron job.
 */
export async function refreshAllCachedPrices(): Promise<{ updated: number; failed: number }> {
  const entries = await db.price.findMany();
  let updated = 0;
  let failed = 0;

  const symbolsToFetch = entries.flatMap(({ code }) => {
    if (code === "AUDUSD") return ["AUDUSD=X"];

    const normalized = code.trim().toUpperCase();
    return normalized.includes(".") ? [normalized] : [`${normalized}.AX`, normalized];
  });

  const quoteMap = await fetchQuoteMap(symbolsToFetch);

  await Promise.all(
    entries.map(async ({ code }) => {
      if (code === "AUDUSD") {
        const rate = getQuotePrice(quoteMap.get("AUDUSD=X")) ?? await fetchSymbol("AUDUSD=X");
        if (rate !== null) {
          await db.price.update({ where: { code }, data: { price: rate } });
          updated++;
        } else {
          failed++;
        }
        return;
      }

      const normalized = code.trim().toUpperCase();
      const result = normalized.includes(".")
        ? (() => {
            const price = getQuotePrice(quoteMap.get(normalized));
            if (price === null) return null;
            const currency: Currency = normalized.endsWith(".AX") ? "aud" : "usd";
            return { price, currency };
          })()
        : (() => {
            const axPrice = getQuotePrice(quoteMap.get(`${normalized}.AX`));
            if (axPrice !== null) return { price: axPrice, currency: "aud" as Currency };

            const usPrice = getQuotePrice(quoteMap.get(normalized));
            if (usPrice !== null) return { price: usPrice, currency: "usd" as Currency };

            return null;
          })() ?? await fetchLivePrice(code);

      if (result !== null) {
        await db.price.update({ where: { code }, data: { price: result.price, currency: result.currency } });
        updated++;
      } else {
        failed++;
      }
    })
  );

  return { updated, failed };
}
