import { NextRequest, NextResponse } from "next/server";
import { refreshAllCachedPrices } from "@/lib/price";

// This endpoint is called by the Railway cron service every 2 hours.
// Protected by a shared secret so it can't be triggered publicly.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshAllCachedPrices();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
}
