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
 * Fetch the latest price for a stock code via Yahoo Finance.
 * If the code has no dot, tries ASX first (appends .AX), then falls back
 * to the bare code for US/international stocks (e.g. META, AAPL, TSLA).
 */
export async function fetchLivePrice(code: string): Promise<number | null> {
  const s = code.trim().toUpperCase();

  if (s.includes(".")) {
    // Explicit suffix provided — use as-is
    return fetchSymbol(s);
  }

  // Try ASX first, fall back to bare code (NASDAQ/NYSE/etc.)
  const asx = await fetchSymbol(`${s}.AX`);
  if (asx !== null) return asx;
  return fetchSymbol(s);
}
