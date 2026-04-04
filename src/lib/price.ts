const API_KEY = process.env.FINNHUB_API_KEY;

/**
 * If the code has no dot we treat it as an ASX stock and append .AX,
 * matching the Python game's behaviour.
 */
function toSymbol(code: string): string {
  const s = code.trim().toUpperCase();
  return s.includes(".") ? s : `${s}.AX`;
}

/**
 * Fetch the latest price for a stock code from Finnhub.
 * Returns null if the price cannot be determined.
 */
export async function fetchLivePrice(code: string): Promise<number | null> {
  if (!API_KEY) {
    console.error("FINNHUB_API_KEY is not set");
    return null;
  }

  const symbol = toSymbol(code);
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    // Finnhub returns { c: currentPrice, h, l, o, pc, t }
    // c === 0 means no data found for the symbol
    const price = data?.c;
    return price && price > 0 ? price : null;
  } catch (e) {
    console.error("fetchLivePrice error:", e);
    return null;
  }
}
