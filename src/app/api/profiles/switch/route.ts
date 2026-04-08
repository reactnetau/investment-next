import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";

/** PATCH /api/profiles/switch — switch the active profile */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId } = await req.json();
  if (!profileId) return NextResponse.json({ error: "profileId is required." }, { status: 400 });

  // Verify the portfolio belongs to this user
  const portfolio = await db.portfolio.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  await db.user.update({
    where: { id: userId },
    data: { activeProfileId: profileId },
  });

  return NextResponse.json({ ok: true });
}
