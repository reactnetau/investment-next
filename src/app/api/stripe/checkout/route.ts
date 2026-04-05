import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getSession, getUserId } from "@/lib/session";

const PRICES: Record<string, { currency: string; amount: number; label: string }> = {
  usd: { currency: "usd", amount: 199, label: "$1.99 USD" }, // ~$2.99 AUD
  aud: { currency: "aud", amount: 299, label: "$2.99 AUD" },
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

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: pricing.currency,
          product_data: { name: "Investment Simulator Pro" },
          unit_amount: pricing.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?upgrade=success`,
    cancel_url: `${appUrl}/dashboard?upgrade=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url, priceLabel: pricing.label });
}
