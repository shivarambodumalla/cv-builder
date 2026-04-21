import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/shared/structured-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "CVEdge is free forever for job seekers. Upgrade to Pro for unlimited access. 80+ ATS score guaranteed or your money back.",
  alternates: { canonical: "https://www.thecvedge.com/pricing" },
  openGraph: {
    title: "Pricing | CVEdge",
    description: "CVEdge is free forever. Upgrade to Pro for unlimited access. 80+ ATS score guaranteed.",
    url: "https://www.thecvedge.com/pricing",
    images: ["/og-pricing.png"],
  },
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Pricing", url: "https://www.thecvedge.com/pricing" },
        ]}
      />
      <ProductJsonLd
        name="CVEdge Pro"
        description="AI-powered CV optimisation with unlimited ATS scans, AI rewrites, job matching, cover letters, and interview coaching. 80+ ATS score guaranteed."
        image="https://www.thecvedge.com/og-pricing.png"
        offers={[
          { name: "Free", price: "0", priceCurrency: "USD" },
          { name: "Pro Weekly", price: "5", priceCurrency: "USD" },
          { name: "Pro Monthly", price: "14", priceCurrency: "USD" },
          { name: "Pro Yearly", price: "120", priceCurrency: "USD" },
        ]}
        ratingValue="4.8"
        ratingCount="124"
      />
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
