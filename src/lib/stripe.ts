import Stripe from "stripe";

// Only instantiate on the server — never import this in client components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});
