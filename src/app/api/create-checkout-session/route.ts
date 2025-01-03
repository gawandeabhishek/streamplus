import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { authOptions } from "@/lib/auth";

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL;

const PLANS = {
  basic: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    name: "Basic Plan"
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    name: "Premium Plan"
  },
  family: {
    priceId: process.env.STRIPE_FAMILY_PRICE_ID,
    name: "Family Plan"
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { planId, interval } = body;

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return new NextResponse("Invalid plan", { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${DOMAIN}/dashboard?success=true`,
      cancel_url: `${DOMAIN}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        planName: plan.name
      }
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 