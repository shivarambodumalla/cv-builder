"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingPeriod = "weekly" | "monthly" | "yearly";

const OPTIONS: { period: BillingPeriod; label: string; original: number; sale: number; per: string; perWeek: string; savePercent: number; popular?: boolean }[] = [
  { period: "weekly", label: "Weekly", original: 10, sale: 5, per: "week", perWeek: "$5.00", savePercent: 50 },
  { period: "monthly", label: "Monthly", original: 35, sale: 14, per: "month", perWeek: "$3.50", savePercent: 60 },
  { period: "yearly", label: "Yearly", original: 420, sale: 120, per: "year", perWeek: "$2.30", savePercent: 71, popular: true },
];

const FREE_FEATURES = [
  "1 CV",
  "3 ATS scans per week",
  "Basic ATS report",
  "1 template (Classic)",
  "PDF export (watermarked)",
];

const PRO_FEATURES = [
  "Unlimited CVs",
  "Unlimited ATS scans",
  "Unlimited job matches",
  "Unlimited cover letters",
  "Unlimited AI rewrites",
  "All 5 templates",
  "Clean PDF exports",
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
  const selected = OPTIONS.find((o) => o.period === billing)!;

  return (
    <>
      <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-2 mb-16">
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
        <div className="rounded-xl border-2 border-primary bg-card p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-bold">Pro</span>
          </div>

          {/* Pricing rows */}
          <div className="space-y-2.5 mb-6">
            {OPTIONS.map((opt) => {
              const isSelected = billing === opt.period;
              return (
                <button
                  key={opt.period}
                  type="button"
                  onClick={() => setBilling(opt.period)}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{opt.label}</span>
                      {opt.popular && (
                        <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{opt.perWeek}/week</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground/50 line-through">${opt.original}</span>
                      <span className="text-xl font-bold">${opt.sale}</span>
                    </div>
                    <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900 dark:text-green-300 leading-none mt-0.5">
                      SAVE {opt.savePercent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center mb-4">
            Prices exclude applicable taxes (GST/VAT). Tax will be calculated at checkout.
          </p>

          {/* Pro features */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Everything included</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[13px]">
                  <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" asChild>
            <Link href="#">Get Pro - ${selected.sale}/{selected.per}</Link>
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            7-day money back guarantee &middot; Cancel anytime
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
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
