import { useSession } from "next-auth/react";
import { SubscriptionStatus } from "@prisma/client";

export function useSubscription() {
  const { data: session } = useSession();
  const subscriptionStatus = session?.user?.subscriptionStatus as SubscriptionStatus;

  return {
    isSubscribed: subscriptionStatus !== "FREE",
    isPremium: subscriptionStatus === "PREMIUM" || subscriptionStatus === "FAMILY",
    isFamily: subscriptionStatus === "FAMILY",
    status: subscriptionStatus,
  };
} 