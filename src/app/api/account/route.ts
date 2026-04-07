import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getSession, getUserId } from "@/lib/session";

export async function DELETE() {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Cancel any active Stripe subscription immediately before deleting
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch {
      // If Stripe cancel fails (e.g. already cancelled), proceed with deletion anyway
    }
  }

  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ message: "Your account has been deleted." });
}
