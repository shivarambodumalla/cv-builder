import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing",
  description: "CVEdge is free forever for job seekers. Upgrade to Pro for unlimited access. 90+ ATS score guaranteed or your money back.",
  alternates: { canonical: "https://thecvedge.com/pricing" },
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          One plan. Full access. Cancel anytime.
        </p>
      </div>
      <PricingContent />
    </div>
  );
}
