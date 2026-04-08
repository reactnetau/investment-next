import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";
import { getAppUrl } from "@/lib/app-url";

const PRICES: Record<string, { currency: string; amount: number; label: string }> = {
  usd: { currency: "usd", amount: 300, label: "$3.00 USD" },
  aud: { currency: "aud", amount: 500, label: "$5.00 AUD" },
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = (body.locale as string) ?? "aud";
  const pricing = PRICES[locale] ?? PRICES.aud;
  const session = await getSession();
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Reuse existing Stripe customer or create a new one
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await db.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = getAppUrl();

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: pricing.currency,
          product_data: { name: "Investment Simulator Pro (One-Time)" },
          unit_amount: pricing.amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard?upgrade=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url, priceLabel: pricing.label });
}
