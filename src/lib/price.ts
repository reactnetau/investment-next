const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

/**
 * If the code has no dot we treat it as an ASX stock and append .AX,
 * matching the Python game's behaviour.
 */
function toSymbol(code: string): string {
  const s = code.trim().toUpperCase();
  return s.includes(".") ? s : `${s}.AX`;
}

/**
 * Fetch the latest price for a stock code from Alpha Vantage.
 * Returns null if the price cannot be determined.
 */
export async function fetchLivePrice(code: string): Promise<number | null> {
  if (!API_KEY) {
    console.error("ALPHA_VANTAGE_API_KEY is not set");
    return null;
  }

  const symbol = toSymbol(code);
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const priceStr = data?.["Global Quote"]?.["05. price"];
    if (!priceStr) return null;

    const price = parseFloat(priceStr);
    return price > 0 ? price : null;
  } catch (e) {
    console.error("fetchLivePrice error:", e);
    return null;
  }
}
