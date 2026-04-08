import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";

/** PATCH /api/profiles/[id] — rename a profile */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await db.portfolio.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Enter a portfolio name." }, { status: 400 });
  }

  const updated = await db.portfolio.update({
    where: { id },
    data: { name: name.trim() },
    select: { id: true, name: true },
  });

  return NextResponse.json({ profile: updated });
}

/** DELETE /api/profiles/[id] — delete a profile */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await db.portfolio.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!portfolio || portfolio.userId !== userId) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // Cannot delete the last profile
  const count = await db.portfolio.count({ where: { userId } });
  if (count <= 1) {
    return NextResponse.json({ error: "You cannot delete your only portfolio." }, { status: 400 });
  }

  // If deleting the active profile, switch to another one first
  const user = await db.user.findUnique({ where: { id: userId }, select: { activeProfileId: true } });
  if (user?.activeProfileId === id) {
    const next = await db.portfolio.findFirst({
      where: { userId, id: { not: id } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (next) {
      await db.user.update({ where: { id: userId }, data: { activeProfileId: next.id } });
    }
  }

  await db.portfolio.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
