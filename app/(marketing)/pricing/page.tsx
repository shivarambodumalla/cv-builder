import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing — CVEdge",
  description:
    "Simple, transparent pricing. Start for free, upgrade to Starter ($12/mo) or Pro ($29/mo) when you need more power. Annual plans save 30%.",
  openGraph: {
    title: "Pricing — CVEdge",
    description:
      "Free, Starter, and Pro plans. Start building your CV today.",
  },
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start for free. Upgrade when you need more power. Cancel anytime.
        </p>
      </div>
      <PricingContent />
    </div>
  );
}
