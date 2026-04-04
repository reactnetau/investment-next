/**
 * If the code has no dot we treat it as an ASX stock and append .AX,
 * matching the Python game's behaviour.
 */
function toSymbol(code: string): string {
  const s = code.trim().toUpperCase();
  return s.includes(".") ? s : `${s}.AX`;
}

/**
 * Fetch the latest price for a stock code via Yahoo Finance (no API key required).
 * Returns null if the price cannot be determined.
 */
export async function fetchLivePrice(code: string): Promise<number | null> {
  const symbol = toSymbol(code);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price =
      meta?.regularMarketPrice ??
      meta?.previousClose ??
      null;

    return price && price > 0 ? price : null;
  } catch (e) {
    console.error("fetchLivePrice error:", e);
    return null;
  }
}
