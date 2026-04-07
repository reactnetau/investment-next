import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  if (checkoutSession.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  await db.user.update({
    where: { id: userId },
    data: {
      plan: "pro",
      stripeCustomerId: checkoutSession.customer as string ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
