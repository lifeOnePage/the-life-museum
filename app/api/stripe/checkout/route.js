import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGE_PRICES = {
  credit_1000: { amount: 999, label: "1,000 Credits" },
  credit_3900: { amount: 2499, label: "3,900 Credits" },
  credit_9900: { amount: 4999, label: "9,900 Credits" },
};

export async function POST(req) {
  try {
    const { locale, userId, package: pkg } = await req.json();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const pricing = PACKAGE_PRICES[pkg] || PACKAGE_PRICES.credit_1000;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Credit Purchase (${pricing.label})`,
              description: "Credits for The Life Museum",
            },
            unit_amount: pricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&locale=${locale || "en"}&package=${pkg || "credit_1000"}`,
      cancel_url: `${origin}/payment/fail?locale=${locale || "en"}`,
      metadata: {
        userId: userId || "anonymous",
        type: "credit_purchase",
        package: pkg || "credit_1000",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
