import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";

export async function DELETE() {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "Please cancel your Pro subscription before deleting your account." },
      { status: 400 }
    );
  }

  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ message: "Your account has been deleted." });
}
