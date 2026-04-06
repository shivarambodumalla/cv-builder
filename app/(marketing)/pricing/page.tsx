import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing | CVEdge | Simple, Transparent Pricing",
  description:
    "One plan. Full access. Cancel anytime. Start free, upgrade to Pro for unlimited CVs, ATS scans, AI rewrites, job matching, and cover letters.",
  openGraph: {
    title: "Pricing | CVEdge",
    description: "Simple, transparent pricing. Start free, go Pro when ready.",
  },
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
