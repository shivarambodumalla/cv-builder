"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingPeriod = "weekly" | "monthly" | "yearly";

const PRO_PRICING: Record<BillingPeriod, { original: number; sale: number; save: string; perWeek?: string; period: string; urgency?: string }> = {
  weekly: { original: 10, sale: 5, save: "SAVE 50%", period: "/week" },
  monthly: { original: 35, sale: 14, save: "SAVE 60%", perWeek: "$3.50/week", period: "/month" },
  yearly: { original: 420, sale: 120, save: "SAVE 71%", perWeek: "$2.30/week", period: "/year", urgency: "Launch pricing — increases soon" },
};

const FREE_FEATURES = [
  "1 CV",
  "3 ATS scans/month",
  "Basic ATS report",
  "1 template (Classic)",
  "PDF export (watermarked)",
];

const PRO_FEATURES = [
  "Unlimited CVs",
  "Unlimited ATS scans",
  "Full ATS report + fixes",
  "AI bullet rewrites (50/month)",
  "5 templates",
  "Job matcher (15/month)",
  "Cover letter AI (10/month)",
  "Clean PDF + HTML export",
  "CV version history",
  "Priority support",
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel with one click, no questions asked." },
  { q: "What payment methods do you accept?", a: "All major credit/debit cards via Lemon Squeezy." },
  { q: "Is my CV data secure?", a: "Yes. Your data is encrypted and never shared." },
  { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime." },
  { q: "Do you offer refunds?", a: "Yes, 7-day money back guarantee." },
];

export function PricingContent() {
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const pro = PRO_PRICING[billing];

  return (
    <>
      {/* Billing toggle */}
      <div className="mb-12 flex items-center justify-center">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {(["weekly", "monthly", "yearly"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setBilling(period)}
              className={cn(
                "relative rounded-md px-4 py-2 text-sm font-medium transition-colors",
                billing === period
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {period === "yearly" ? "Yearly" : period === "monthly" ? "Monthly" : "Weekly"}
              {period === "yearly" && (
                <span className="ml-1.5 text-[10px]">Best value</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mx-auto mb-16 grid max-w-4xl gap-6 lg:grid-cols-2">
        {/* Free card */}
        <div className="rounded-xl border bg-card p-6 sm:p-8 flex flex-col">
          <span className="mb-4 inline-block w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">Forever free</span>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
          </div>
          <ul className="mb-8 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/upload-resume">Get started free</Link>
          </Button>
        </div>

        {/* Pro card */}
        <div className="rounded-xl border-2 border-primary bg-card p-6 sm:p-8 flex flex-col relative">
          <span className="mb-4 inline-block w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Most popular
          </span>
          <div className="mb-2">
            <span className="text-lg text-muted-foreground line-through mr-2">${pro.original}</span>
            <span className="text-4xl font-bold">${pro.sale}</span>
            <span className="text-muted-foreground">{pro.period}</span>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
              {pro.save}{billing === "yearly" ? " " : ""}
            </span>
            {pro.perWeek && (
              <span className="text-xs text-muted-foreground">{pro.perWeek}</span>
            )}
          </div>
          {pro.urgency && (
            <p className="mb-4 text-xs font-medium text-amber-600 dark:text-amber-400">{pro.urgency}</p>
          )}
          <ul className="mb-8 flex-1 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button className="w-full" asChild>
            <Link href="#">Get Pro &rarr;</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">No commitment. Cancel anytime.</p>
        </div>
      </div>

      {/* Per-week comparison */}
      <div className="mx-auto mb-20 max-w-2xl">
        <h3 className="mb-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cost per week</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-4">
            <p className="text-lg font-bold">$5.00</p>
            <p className="text-xs text-muted-foreground">Weekly</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-lg font-bold">$3.50</p>
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="mt-1 text-[10px] font-medium text-green-600">better</p>
          </div>
          <div className="rounded-lg border-2 border-primary p-4">
            <p className="text-lg font-bold">$2.30</p>
            <p className="text-xs text-muted-foreground">Yearly</p>
            <p className="mt-1 text-[10px] font-bold text-green-600">best</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
        onClick={() => setOpen(!open)}
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-3">
          <p className="text-sm text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}
