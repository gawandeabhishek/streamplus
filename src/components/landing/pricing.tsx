"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$9.99",
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
    price: "$19.99",
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
    price: "$29.99",
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

export function Pricing() {
  return (
    <section id="pricing" className="py-16 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Select the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`relative rounded-2xl border p-8 shadow-sm ${
                plan.popular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "gradient" : "outline"}
                className="w-full"
              >
                Start Free Trial
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 