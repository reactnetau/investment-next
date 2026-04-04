// yahoo-finance2 v3: the default export is the YahooFinance class, not an instance.
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

/**
 * If the code has no dot we treat it as an ASX stock and append .AX,
 * matching the Python game's behaviour.
 */
function toYahooSymbol(code: string): string {
  const s = code.trim().toUpperCase();
  return s.includes(".") ? s : `${s}.AX`;
}

/**
 * Fetch the latest price for a stock code from Yahoo Finance.
 * Returns null if the price cannot be determined.
 */
export async function fetchLivePrice(code: string): Promise<number | null> {
  const symbol = toYahooSymbol(code);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote: any = await yahooFinance.quote(symbol);
    const price: number | null =
      quote?.regularMarketPrice ??
      quote?.regularMarketPreviousClose ??
      null;
    if (price && price > 0) return price;
  } catch {
    // fall through to history fallback
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = await (yahooFinance.historical as any)(symbol, {
      period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      interval: "1d",
    });
    if (result && result.length > 0) {
      const last = result[result.length - 1];
      const price: number | null = last.adjClose ?? last.close ?? null;
      if (price && price > 0) return price;
    }
  } catch {
    // both paths failed
  }

  return null;
}
