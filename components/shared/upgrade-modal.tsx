"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpgradeModal, type UpgradeTrigger } from "@/context/upgrade-modal-context";
import { BILLING_PERIODS, PRO_PLANS, PROMO, firstPaymentUsd, formatInr, formatUsd, promoFor, type BillingPeriod } from "@/lib/billing/pricing";
import { useIsIndia } from "@/lib/billing/use-is-india";

/** One row per billing period, from the shared pricing module; yearly is the headline deal. */
const OPTIONS = BILLING_PERIODS.map((period) => ({
  ...PRO_PLANS[period],
  promo: promoFor(period),
  first: firstPaymentUsd(period),
  popular: period === "yearly",
}));

// Free quotas are either lifetime (one ATS scan) or Pro-only, so no headline
// promises a reset: the way forward is always Pro.
const HEADLINES: Record<UpgradeTrigger, { title: string; subtitle: string; icon: "crown" | "zap" | "sparkles" }> = {
  cv_limit: { title: "Resume limit reached", subtitle: "Upgrade to create unlimited resumes tailored for different roles.", icon: "crown" },
  ats_limit: { title: "You've used your free ATS scan", subtitle: "Pro gives you unlimited scans and the full report: every issue, missing keywords and suggestions.", icon: "zap" },
  rewrite_limit: { title: "AI rewrites are a Pro feature", subtitle: "Rewrite any bullet or summary, as often as you like.", icon: "sparkles" },
  job_match_limit: { title: "Job Match is a Pro feature", subtitle: "Score your resume against any job description and see what to fix.", icon: "sparkles" },
  cover_letter_limit: { title: "Cover letters are a Pro feature", subtitle: "Generate a letter for any job in three tones, then edit and export it.", icon: "sparkles" },
  fix_all_limit: { title: "Fix All is a Pro feature", subtitle: "Rewrite your summary and every bullet in one pass.", icon: "sparkles" },
  cv_tailor_limit: { title: "Tailor CV is a Pro feature", subtitle: "Rewrite your resume for one job description in a single pass.", icon: "sparkles" },
  offer_eval_limit: { title: "Offer evaluation is a Pro feature", subtitle: "Grade any job description on seniority, clarity, growth and balance.", icon: "sparkles" },
  portfolio_scan_limit: { title: "Extracting answers from your resume is a Pro feature", subtitle: "Turn your resume, portfolio or GitHub into STAR answers you can review and save.", icon: "sparkles" },
  story_summary_limit: { title: "Answer summaries are a Pro feature", subtitle: "Turn any experience into a short answer you can say out loud.", icon: "sparkles" },
  interview_prep_limit: { title: "Interview prep is a Pro feature", subtitle: "Paste a job description to see which experiences to lead with.", icon: "sparkles" },
  template_locked: { title: "This template is Pro", subtitle: "Pro includes clean PDFs, unlimited scans and every AI tool.", icon: "crown" },
  download: { title: "Remove the CVEdge footer", subtitle: "Free downloads include a small footer line. Pro exports clean PDFs and unlocks every AI tool.", icon: "zap" },
  generic: { title: "Upgrade to Pro", subtitle: "Clean PDFs, the full ATS report and every AI tool.", icon: "crown" },
};

const FEATURES = [
  "Clean PDFs, no footer",
  "Unlimited ATS scans and the full report",
  "AI rewrites and Fix All",
  "Job Match and Tailor CV",
  "Cover letters",
  "Interview Coach AI",
  "80+ ATS score guarantee",
  "Priority support",
];

export function UpgradeModal() {
  const { isOpen, trigger, closeUpgradeModal } = useUpgradeModal();
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) { setSuccess(false); setBilling("yearly"); }
  }, [isOpen]);

  const headline = HEADLINES[trigger];
  const selected = OPTIONS.find((o) => o.period === billing)!;
  const isIndia = useIsIndia();
  const HeadlineIcon = headline.icon === "crown" ? Crown : headline.icon === "zap" ? Zap : Sparkles;

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/billing/checkout-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: billing }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      }
    } catch { /* ignore */ }
    setCheckoutLoading(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => { if (!v) closeUpgradeModal(); }}>
      <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto p-0" aria-describedby={undefined} data-testid="upgrade-modal">
        <SheetTitle className="sr-only">Upgrade to Pro</SheetTitle>
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 px-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-success/30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">You&apos;re on Pro!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Every feature is now available. Refreshing...
            </p>
          </div>
        ) : (
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-6 pt-8 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <HeadlineIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{headline.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{headline.subtitle}</p>
          </div>

          <div className="px-6 pb-6 space-y-5">
            {/* Pricing rows — all with borders */}
            <div className="space-y-2.5">
              {OPTIONS.map((opt) => {
                const isSelected = billing === opt.period;
                return (
                  <button
                    key={opt.period}
                    type="button"
                    onClick={() => setBilling(opt.period)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-muted-foreground/40"
                    )}
                  >
                    {/* Radio */}
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{opt.label}</span>
                        {opt.popular && (
                          <span className="rounded-full bg-[#065F46] px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                            BEST VALUE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {opt.promo
                          ? `Code ${opt.promo.code} applied at checkout · then ${formatUsd(opt.listPrice)}/${opt.per}`
                          : `${formatUsd(opt.listPrice)}/${opt.per}`}
                      </p>
                      {isIndia && (
                        <p className="text-[11px] text-muted-foreground">
                          ≈ {formatInr(opt.first)} {opt.promo ? `for your first ${opt.per}` : `/${opt.per}`}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline gap-1.5">
                        {opt.promo && (
                          <span className="text-xs text-muted-foreground/50 line-through">{formatUsd(opt.listPrice)}</span>
                        )}
                        <span className="text-xl font-bold">{formatUsd(opt.first)}</span>
                      </div>
                      {opt.promo && (
                        <span className="inline-block rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success leading-none mt-0.5">
                          {opt.promo.percent}% OFF
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tax note */}
            <p className="text-[10px] text-muted-foreground/60 text-center">
              Prices exclude sales tax, GST or VAT, which is calculated at checkout.
              {PROMO && " Discount codes apply to your first payment; renewals are at the regular price."}
            </p>

            {/* Features */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Everything included</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-[13px]">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading
                ? "Processing..."
                : selected.promo
                  ? `Get Pro: ${formatUsd(selected.first)} for your first ${selected.per}`
                  : `Get Pro: ${formatUsd(selected.listPrice)}/${selected.per}`}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              &#10003; Cancel anytime &middot; &#10003; Instant access after payment
            </p>
          </div>
        </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
