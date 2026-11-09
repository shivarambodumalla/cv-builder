"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_FAQS } from "./faqs";
import { describeQuota, isProOnly, type PlanQuotas } from "@/lib/billing/format-limits";
import { BILLING_PERIODS, PRO_PLANS, firstPaymentUsd, formatInr, formatUsd, promoFor, type BillingPeriod } from "@/lib/billing/pricing";
import { useIsIndia } from "@/lib/billing/use-is-india";

/** One row per billing period: list price, the promo on it (if any) and what the first payment costs. */
const OPTIONS = BILLING_PERIODS.map((period) => ({
  ...PRO_PLANS[period],
  promo: promoFor(period),
  first: firstPaymentUsd(period),
}));

/** Free-plan quotas worth a line on the card; features the plan does not include are skipped. */
const FREE_QUOTA_FEATURES = ["cvs", "ats_scans", "pdf_downloads"];

const PRO_FEATURES = [
  "Clean PDFs, no footer",
  "Unlimited ATS scans and the full report",
  "AI rewrites and Fix All",
  "Job Match and Tailor CV",
  "Cover letters",
  "Offer evaluation",
  "Interview Coach AI",
  "Salary insights",
  "80+ ATS score guarantee",
  "Priority support",
];

export function PricingContent({ limits }: { limits: { free: PlanQuotas; pro: PlanQuotas } }) {
  const freeFeatures = [
    ...FREE_QUOTA_FEATURES.filter((f) => !isProOnly(limits.free[f])).map((f) => describeQuota(limits.free, f)),
    "All templates",
    "Career Path",
    "Blank Word templates",
    "Interview Coach: write your own answers",
  ];
  const proFeatures = [describeQuota(limits.pro, "cvs"), ...PRO_FEATURES];
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const selected = OPTIONS.find((o) => o.period === billing)!;
  const isIndia = useIsIndia();

  return (
    <>
      {/* Guarantee pill */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#C8F0D6] px-4 py-2 text-[#065F46]">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Pro: 80+ ATS score or a full refund</span>
        </div>
      </div>

      {/* Two-card pricing */}
      <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2 mb-16">
        {/* FREE CARD */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8 flex flex-col">
          <p className="text-base text-muted-foreground mb-2">Free forever</p>
          <div className="mb-2">
            <span className="text-5xl sm:text-6xl font-bold tracking-tight">$0</span>
          </div>
          <p className="text-sm text-muted-foreground mb-8">No credit card required</p>

          <ul className="mb-8 flex-1 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8F0D6]">
                  <Check className="h-3 w-3 text-[#065F46]" />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mb-6 text-xs text-muted-foreground">PDFs include a small CVEdge footer. Pro removes it.</p>

          <Link
            href="/resume-checker"
            className="block w-full rounded-xl border border-[#065F46]/30 bg-background px-6 py-3 text-center text-sm font-semibold text-[#065F46] hover:bg-[#065F46]/5 transition-colors"
          >
            Start free
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">No credit card required</p>
        </div>

        {/* PRO CARD */}
        <div className="relative rounded-2xl bg-[#065F46] p-6 sm:p-8 flex flex-col text-white">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F59E0B] px-4 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
            Most Popular
          </span>

          <p className="text-base text-white/80 mb-6">Pro: everything included</p>

          {/* Period selector — 3 tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-black/20 p-1.5 mb-6" role="radiogroup" aria-label="Billing period">
            {OPTIONS.map((opt) => {
              const isSelected = billing === opt.period;
              return (
                <button
                  key={opt.period}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setBilling(opt.period)}
                  className={cn(
                    "relative rounded-xl px-3 py-4 text-center transition-all",
                    isSelected ? "bg-[#0A7A5A] shadow-lg" : "hover:bg-white/5"
                  )}
                >
                  <div className={cn("text-xs mb-1", isSelected ? "text-white/90" : "text-white/70")}>
                    {opt.label}
                  </div>
                  <div className={cn("text-xl sm:text-2xl font-bold", isSelected ? "text-[#34D399]" : "text-white")}>
                    {opt.promo && (
                      <span className="mr-1.5 text-xs font-medium text-white/50 line-through">{formatUsd(opt.listPrice)}</span>
                    )}
                    {formatUsd(opt.first)}
                  </div>
                  {opt.promo && isSelected && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F59E0B] px-2.5 py-0.5 text-[10px] font-bold text-white">
                      {opt.promo.percent}% OFF
                    </span>
                  )}
                  {opt.promo && !isSelected && (
                    <div className="text-[11px] text-white/60">{opt.promo.percent}% off</div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mb-6 space-y-1 text-sm text-white/80">
            {selected.promo ? (
              <p>
                Code <span className="font-semibold text-white">{selected.promo.code}</span> is applied at checkout.
                Then {formatUsd(selected.listPrice)}/{selected.per}. Cancel anytime.
              </p>
            ) : (
              <p>{formatUsd(selected.listPrice)}/{selected.per}. Cancel anytime.</p>
            )}
            {isIndia && (
              <p className="text-white/70">
                {selected.promo
                  ? `≈ ${formatInr(selected.first)} for your first ${selected.per}, then ≈ ${formatInr(selected.listPrice)}/${selected.per}`
                  : `≈ ${formatInr(selected.listPrice)}/${selected.per}`}
              </p>
            )}
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34D399]/20">
                  <Check className="h-3 w-3 text-[#34D399]" />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="block w-full rounded-xl bg-[#34D399] px-6 py-4 text-center text-base font-bold text-[#065F46] hover:bg-[#34D399]/90 transition-colors"
          >
            Get interview-ready today
          </Link>
          <p className="mt-3 text-center text-xs text-white/60">
            Cancel anytime · Instant access after payment
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {[
          { n: "130+", l: "Job roles supported" },
          { n: "6", l: "ATS score categories" },
          { n: "2,400+", l: "Keywords checked" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-[#065F46]">{s.n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      {/* SEO content block — explains what you get, crawlable copy */}
      <section className="mx-auto max-w-3xl mb-16 prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight">
        <h2 className="text-2xl font-bold tracking-tight mb-4 text-center">What you get with CVEdge Pro</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The free plan gives you a resume, an ATS score with your top issues, every template and PDF downloads with a small CVEdge footer. Pro adds the rest: unlimited ATS scans with the full report (every issue, missing keywords and suggestions), AI rewrites and Fix All, Job Match and Tailor CV, cover letters for every application, offer evaluation, Interview Coach AI, salary insights, and clean PDFs with no footer.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Every Pro feature works across 130+ job roles and 12 industry domains, from software engineering and product management to finance, marketing, and design. Our ATS scoring engine checks your resume across 6 categories (contact accuracy, section coverage, keyword density, measurable results, bullet quality, and formatting) against 2,400+ role-specific keywords, so recruiters&apos; screening software actually sees your experience.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Pro also comes with the 80+ score guarantee. If your ATS score stays under 80 after Fix All, claim within 14 days of signing up and we refund you in full.
        </p>
      </section>

      {/* FAQ */}
      <div className="mx-auto max-w-[720px] mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
          <p className="mt-3 text-base text-muted-foreground">Answers on pricing, billing, and the 80+ guarantee.</p>
        </div>
        <div>
          {PRICING_FAQS.map((faq, i) => (
            <div key={i} className="border-b border-border">
              <button
                type="button"
                onClick={() => setOpenFaqs((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                className={cn(
                  "flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors",
                  openFaqs.has(i) ? "text-[#065F46]" : "text-foreground hover:text-[#065F46]"
                )}
                aria-expanded={openFaqs.has(i)}
              >
                {faq.question}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#065F46] transition-transform duration-200", openFaqs.has(i) && "rotate-180")} />
              </button>
              {openFaqs.has(i) && <p className="pb-5 text-[15px] text-muted-foreground leading-relaxed">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="mx-auto max-w-md text-center py-8 mb-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C8F0D6]">
          <Shield className="h-6 w-6 text-[#065F46]" />
        </div>
        <p className="text-base font-semibold">80+ score guarantee: full refund within 14 days</p>
        <p className="text-sm text-muted-foreground mt-2">Pro only. If your score stays under 80 after Fix All, claim within 14 days of signing up and we refund you in full.</p>
      </div>

      {/* Bottom CTA */}
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#065F46] p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-white">Still thinking about it?</h2>
        <p className="mt-2 text-sm text-green-200">Start free. No credit card needed. Upgrade when you&apos;re ready.</p>
        <Link
          href="/resume-checker"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-semibold text-[#065F46] hover:bg-white/90 transition-colors"
        >
          Analyze my resume free
        </Link>
        <p className="mt-4 text-[11px] text-green-300">
          ✓ Free forever &middot; ✓ Upgrade anytime &middot; ✓ Cancel anytime
        </p>
      </div>
    </>
  );
}
