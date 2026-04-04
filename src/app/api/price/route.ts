import { NextRequest, NextResponse } from "next/server";
import { fetchLivePrice } from "@/lib/price";
import { getSession, getUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!getUserId(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code?.trim()) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const price = await fetchLivePrice(code.trim());
  if (price === null) {
    return NextResponse.json({ error: "Could not fetch price" }, { status: 404 });
  }

  return NextResponse.json({ price });
}
