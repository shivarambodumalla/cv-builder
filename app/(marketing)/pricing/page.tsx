import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";
import { PRICING_FAQS } from "./faqs";
import { BreadcrumbJsonLd, ProductJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { getPlanLimits } from "@/lib/billing/plan-config";
import { proFromPhrase } from "@/lib/billing/pricing";

// Plan quotas come from plan_limits. force-static keeps the page static (the
// admin client's no-store fetch would otherwise make it dynamic); it re-reads
// the quotas hourly.
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Pricing: Free plan, ${proFromPhrase()}`,
  description:
    `Free ATS score, resume builder and templates for job seekers in the US, Canada, UK, UAE, Saudi Arabia, and Europe. ${proFromPhrase()}: full ATS report, AI rewrites, Job Match, clean PDFs. 80+ score guarantee.`,
  alternates: {
    canonical: "https://www.thecvedge.com/pricing",
    languages: {
      "en-US": "https://www.thecvedge.com/pricing",
      "en-GB": "https://www.thecvedge.com/pricing",
      "en-AE": "https://www.thecvedge.com/pricing",
      "en-SA": "https://www.thecvedge.com/pricing",
      "en-QA": "https://www.thecvedge.com/pricing",
      "x-default": "https://www.thecvedge.com/pricing",
    },
  },
  openGraph: {
    title: `CVEdge Pricing: Free plan, ${proFromPhrase()}`,
    description: "Full ATS report, AI rewrites, Job Match and clean PDFs with no footer. For job seekers in the US, Canada, UK, UAE, Saudi Arabia, and Europe. 80+ ATS score guarantee.",
    url: "https://www.thecvedge.com/pricing",
    images: ["/og-pricing.png"],
  },
};

export default async function PricingPage() {
  const limits = await getPlanLimits();

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Pricing", url: "https://www.thecvedge.com/pricing" },
        ]}
      />
      <ProductJsonLd
        name="CVEdge Pro"
        description="CVEdge Pro: unlimited ATS scans with the full report, AI rewrites and Fix All, Job Match and Tailor CV, cover letters, Interview Coach AI and clean PDFs with no footer. 80+ ATS score guarantee."
        image="https://www.thecvedge.com/og-pricing.png"
        offers={[
          { name: "Free", price: "0", priceCurrency: "USD" },
          { name: "Pro Weekly", price: "5", priceCurrency: "USD" },
          { name: "Pro Monthly", price: "14", priceCurrency: "USD" },
          { name: "Pro Yearly", price: "120", priceCurrency: "USD" },
        ]}
      />
      <FaqJsonLd items={PRICING_FAQS} />

      {/* Header */}
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Free plan. {proFromPhrase()}.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Simple, transparent pricing: one Pro plan, full access, cancel anytime.
        </p>
      </header>

      <PricingContent limits={limits} />
    </div>
  );
}
