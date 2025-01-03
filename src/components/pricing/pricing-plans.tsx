"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Basic",
    price: "9.99",
    description: "Perfect for getting started",
    features: [
      "Basic features",
      "1 user",
      "5GB storage",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    name: "Premium",
    price: "19.99",
    description: "Best for professionals",
    popular: true,
    features: [
      "All Basic features",
      "5 users",
      "50GB storage",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  {
    name: "Family",
    price: "29.99",
    description: "For teams and organizations",
    features: [
      "All Premium features",
      "10 users",
      "100GB storage",
      "24/7 support",
      "Enterprise analytics",
      "Custom integrations",
      "API access",
    ],
  },
];

export function PricingPlans() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
        }),
      });

      const data = await response.json();

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-16">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4 rounded-full border p-1">
          <Button
            variant={billingInterval === "monthly" ? "default" : "ghost"}
            onClick={() => setBillingInterval("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === "yearly" ? "default" : "ghost"}
            onClick={() => setBillingInterval("yearly")}
          >
            Yearly
            <span className="ml-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
              20% OFF
            </span>
          </Button>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={plan.popular ? "border-primary" : undefined}>
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1 text-center text-sm font-medium text-white">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.name.toLowerCase())}
                  disabled={loading === plan.name.toLowerCase()}
                >
                  {loading === plan.name.toLowerCase() ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 