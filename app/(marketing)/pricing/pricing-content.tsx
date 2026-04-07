"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/chip";

type BillingPeriod = "weekly" | "monthly" | "yearly";

const OPTIONS: { period: BillingPeriod; label: string; original: number; sale: number; per: string; perWeek: string; savePercent: number; popular?: boolean }[] = [
  { period: "weekly", label: "Weekly", original: 10, sale: 5, per: "week", perWeek: "$5.00", savePercent: 50 },
  { period: "monthly", label: "Monthly", original: 35, sale: 14, per: "month", perWeek: "$3.50", savePercent: 60 },
  { period: "yearly", label: "Yearly", original: 420, sale: 120, per: "year", perWeek: "$2.30", savePercent: 71, popular: true },
];

const FREE_FEATURES = [
  "1 CV (upgrade for unlimited)",
  "3 ATS scans every 7 days",
  "Full ATS report (view only)",
  "Classic template",
  "1 watermarked PDF download/week",
];

const PRO_FEATURES = [
  "Unlimited CVs - save every version",
  "Unlimited ATS scans - analyse every draft",
  "Unlimited job matches - paste any JD",
  "Unlimited cover letters - tailored to every role",
  "Unlimited AI rewrites - improve any bullet",
  "All 5 templates - Classic, Sharp, Minimal, Executive, Sidebar",
  "Clean PDF exports - no watermark",
  "Real-time ATS score updates",
  "Job description keyword gap analysis",
  "Priority support",
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel with one click from your billing page. No emails to send, no forms to fill. Your access continues until the end of your billing period." },
  { q: "What payment methods do you accept?", a: "All major credit and debit cards (Visa, Mastercard, Amex) via Lemon Squeezy. Secure checkout, no card details stored on our servers." },
  { q: "Is my CV data secure?", a: "Yes. Your CV is stored securely and privately in your account. We never sell your data, share it with third parties, or use it to train AI models." },
  { q: "Can I switch plans?", a: "Yes. Switch between weekly, monthly and yearly anytime. If you upgrade mid-cycle, you only pay the difference." },
  { q: "How is CVEdge different from Resumeworded or Jobscan?", a: "CVEdge combines ATS scoring, AI bullet rewrites, job matching, and cover letter generation in one tool. Most tools only do one of these and charge more." },
  { q: "Do I need to start from scratch?", a: "No. Upload your existing CV as a PDF and we parse everything automatically. Improve what you have, no blank templates." },
  { q: "What roles and industries do you support?", a: "130+ roles across 12 domains: Engineering, Design, Product, Data, Marketing, Sales, Finance, HR, Operations, Content, Mechanical, and New Age." },
  { q: "Will recruiters know I used AI?", a: "No. CVEdge suggests improvements based on your actual experience. Every change is reviewed and approved by you. Your CV stays yours." },
];

export function PricingContent() {
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const selected = OPTIONS.find((o) => o.period === billing)!;

  const nudge = billing === "weekly" ? "Switch to monthly, 3x cheaper than weekly" : billing === "monthly" ? "Switch to yearly and save $48" : null;

  return (
    <>
      {/* Trust bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {["Cancel anytime", "No credit card to start", "Your data never sold"].map((t) => (
          <Chip key={t} variant="trust">
            <Check className="h-3 w-3 text-[#065F46]" /> {t}
          </Chip>
        ))}
      </div>

      <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-2 mb-16">
        {/* Free card */}
        <div className="rounded-xl border bg-card p-6 sm:p-8 flex flex-col">
          <span className="mb-4 inline-block w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">Forever free</span>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
          </div>
          <ul className="mb-8 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/upload-resume">Get started free <span className="ml-1">&rarr;</span></Link>
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">No credit card required</p>
        </div>

        {/* Pro card */}
        <div className="rounded-xl border-2 border-primary bg-card p-6 sm:p-8 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold text-white">MOST POPULAR</span>
          </div>

          <div className="flex items-center gap-2 mb-4 mt-1">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-bold">Pro</span>
          </div>

          {/* Pricing rows */}
          <div className="space-y-2.5 mb-4">
            {OPTIONS.map((opt) => {
              const isSelected = billing === opt.period;
              return (
                <button
                  key={opt.period}
                  type="button"
                  onClick={() => setBilling(opt.period)}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all", isSelected ? "border-primary bg-primary" : "border-muted-foreground/30")}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{opt.label}</span>
                      {opt.popular && <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">BEST VALUE</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{opt.perWeek}/week</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground/50 line-through">${opt.original}</span>
                      <span className="text-xl font-bold">${opt.sale}</span>
                    </div>
                    <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900 dark:text-green-300 leading-none mt-0.5">SAVE {opt.savePercent}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nudge */}
          {nudge && <p className="text-[11px] text-amber-700 dark:text-amber-400 text-center mb-3">&#128161; {nudge}</p>}

          {/* Yearly special */}
          {billing === "yearly" && (
            <div className="text-center mb-4 space-y-1">
              <p className="text-[12px] text-muted-foreground italic">$0.33/day, less than your morning chai</p>
              <span className="inline-block rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-semibold text-[#B45309]">Launch pricing, increases soon</span>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/60 text-center mb-4">Prices exclude applicable taxes (GST/VAT)</p>

          {/* Pro features */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Everything included</p>
            <div className="space-y-1.5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-1.5 text-[13px]">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full h-12 text-base font-semibold" asChild>
            <Link href="#">Get Pro - ${selected.sale}/{selected.per} <span className="ml-1">&rarr;</span></Link>
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            &#10003; Cancel anytime &middot; &#10003; Instant access after payment
          </p>
        </div>
      </div>

      {/* Value comparison */}
      <div className="mx-auto max-w-3xl mb-16">
        <p className="text-center text-sm font-medium text-muted-foreground mb-6">What $120/year gets you</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: "130+", l: "Job roles supported" },
            { n: "6", l: "ATS score categories" },
            { n: "2,400+", l: "Keywords checked" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border bg-card p-5 text-center">
              <p className="text-3xl font-bold text-[#065F46]">{s.n}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-[720px] mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
          <p className="mt-3 text-base text-[#78716C]">Everything you need to know about pricing.</p>
        </div>
        <div>
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-[#E0D8CC] dark:border-border">
              <button
                type="button"
                onClick={() => setOpenFaqs((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                className={cn(
                  "flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors",
                  openFaqs.has(i) ? "text-[#065F46]" : "text-[#0C1A0E] dark:text-foreground hover:text-[#065F46]"
                )}
              >
                {faq.q}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#065F46] transition-transform duration-200", openFaqs.has(i) && "rotate-180")} />
              </button>
              {openFaqs.has(i) && <p className="pb-5 text-[15px] text-[#78716C] dark:text-muted-foreground leading-[1.8]">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#065F46] p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-white">Still thinking about it?</h2>
        <p className="mt-2 text-sm text-green-200">Start free, no credit card needed. Upgrade when you&apos;re ready.</p>
        <Button size="lg" className="mt-6 h-12 px-8 bg-white text-[#065F46] hover:bg-white/90 font-semibold" asChild>
          <Link href="/upload-resume">Analyse my CV free &rarr;</Link>
        </Button>
        <p className="mt-4 text-[11px] text-green-300">
          &#10003; Free forever &middot; &#10003; Upgrade anytime &middot; &#10003; Cancel anytime
        </p>
      </div>
    </>
  );
}
