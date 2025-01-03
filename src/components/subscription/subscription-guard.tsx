"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Crown } from "lucide-react";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature: "watch-together" | "chat" | "all";
}

export function SubscriptionGuard({ children, feature }: SubscriptionGuardProps) {
  const { isPremium } = useSubscription();

  if (!isPremium && (feature === "watch-together" || feature === "all")) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Crown className="h-12 w-12 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-muted-foreground mb-6">
          Watch together with friends in real-time with our Premium plan.
        </p>
        <Button asChild>
          <Link href="/pricing">Upgrade to Premium</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
} 