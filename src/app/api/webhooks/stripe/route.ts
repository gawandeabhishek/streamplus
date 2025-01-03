import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  switch (event.type) {
    case "checkout.session.completed":
      if (!session?.metadata?.userId) {
        return new NextResponse("User ID is required", { status: 400 });
      }

      await prisma.user.update({
        where: {
          id: session.metadata.userId,
        },
        data: {
          stripeCustomerId: session.customer as string,
          subscriptionStatus: (session.metadata.planName === "Basic" 
            ? "BASIC" 
            : session.metadata.planName === "Premium" 
              ? "PREMIUM" 
              : "FAMILY") as SubscriptionStatus,
        },
      });
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.update({
        where: {
          stripeCustomerId: subscription.customer as string,
        },
        data: {
          subscriptionStatus: "FREE",
        },
      });
      break;
  }

  return new NextResponse(null, { status: 200 });
} 