import { Metadata } from "next";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing | TubePlus",
  description: "Choose the perfect plan for your needs",
};

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Select the perfect plan for your needs. All plans include a 14-day free trial.
        </p>
      </div>
      <PricingPlans />
    </div>
  );
} 