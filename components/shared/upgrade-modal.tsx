"use client";

import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Briefcase, Check, Crown, FileText, Target, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpgradeModal, type UpgradeTrigger } from "@/context/upgrade-modal-context";
import { BILLING_PERIODS, PRO_PLANS, PROMO, firstPaymentUsd, formatInr, formatUsd, promoFor, type BillingPeriod, type ProPlan } from "@/lib/billing/pricing";
import { useIsIndia } from "@/lib/billing/use-is-india";

const PER_SHORT: Record<ProPlan["per"], string> = { week: "wk", month: "mo", year: "yr" };

/** One row per billing period, from the shared pricing module; yearly is the headline deal. */
const OPTIONS = BILLING_PERIODS.map((period) => ({
  ...PRO_PLANS[period],
  promo: promoFor(period),
  first: firstPaymentUsd(period),
  popular: period === "yearly",
}));

type Option = (typeof OPTIONS)[number];

const LIMIT = "Free limit reached";
const PRO_FEATURE = "Pro feature";

// Free quotas are either lifetime (one ATS scan) or Pro-only, so no headline
// promises a reset: the way forward is always Pro.
const HEADLINES: Record<UpgradeTrigger, { eyebrow: string; title: string; subtitle: string }> = {
  cv_limit: { eyebrow: LIMIT, title: "Resume limit reached", subtitle: "Upgrade to create unlimited resumes tailored for different roles." },
  ats_limit: { eyebrow: LIMIT, title: "You've used your free ATS scan", subtitle: "Pro gives you unlimited scans and the full report: every issue, missing keywords and suggestions." },
  rewrite_limit: { eyebrow: PRO_FEATURE, title: "AI rewrites are a Pro feature", subtitle: "Rewrite any bullet or summary, as often as you like." },
  job_match_limit: { eyebrow: PRO_FEATURE, title: "Job Match is a Pro feature", subtitle: "Score your resume against any job description and see what to fix." },
  cover_letter_limit: { eyebrow: PRO_FEATURE, title: "Cover letters are a Pro feature", subtitle: "Generate a letter for any job in three tones, then edit and export it." },
  fix_all_limit: { eyebrow: PRO_FEATURE, title: "Fix All is a Pro feature", subtitle: "Rewrite your summary and every bullet in one pass." },
  cv_tailor_limit: { eyebrow: PRO_FEATURE, title: "Tailor CV is a Pro feature", subtitle: "Rewrite your resume for one job description in a single pass." },
  offer_eval_limit: { eyebrow: PRO_FEATURE, title: "Offer evaluation is a Pro feature", subtitle: "Grade any job description on seniority, clarity, growth and balance." },
  portfolio_scan_limit: { eyebrow: PRO_FEATURE, title: "Extracting answers from your resume is a Pro feature", subtitle: "Turn your resume, portfolio or GitHub into STAR answers you can review and save." },
  story_summary_limit: { eyebrow: PRO_FEATURE, title: "Answer summaries are a Pro feature", subtitle: "Turn any experience into a short answer you can say out loud." },
  interview_prep_limit: { eyebrow: PRO_FEATURE, title: "Interview prep is a Pro feature", subtitle: "Paste a job description to see which experiences to lead with." },
  template_locked: { eyebrow: "Pro template", title: "This template is Pro", subtitle: "Pro includes clean PDFs, unlimited scans and every AI tool." },
  download: { eyebrow: "CVEdge Pro", title: "Remove the CVEdge footer", subtitle: "Free downloads include a small footer line. Pro exports clean PDFs and unlocks every AI tool." },
  generic: { eyebrow: "CVEdge Pro", title: "Upgrade to Pro", subtitle: "Clean PDFs, the full ATS report and every AI tool." },
};

const UNLOCKS: { icon: LucideIcon; title: string; body: string; pill?: string }[] = [
  { icon: FileText, title: "Unlimited resumes", body: "AI rewrites, Fix All and clean PDFs with no footer" },
  { icon: Target, title: "Beat the ATS", body: "Unlimited scans with the full report", pill: "80+ score guarantee" },
  { icon: Briefcase, title: "Land the job", body: "Job Match, Tailor CV, cover letters and Interview Coach" },
];

const MUTED = "text-[#5F5954]";
const CAPS = "text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5F5954]";
const SMALL_PILL = "rounded-md bg-[#D1FAE5] px-1.5 py-[3px] text-[10px] font-bold uppercase leading-[1.2] tracking-[0.04em] text-[#065F46]";

/** Sub line under the plan name. The promo covers the first payment only. */
function planSubline(opt: Option, isIndia: boolean): string {
  if (opt.promo) {
    return isIndia
      ? `≈ ${formatInr(opt.first)} for your first ${opt.per}`
      : `then ${formatUsd(opt.listPrice)}/${PER_SHORT[opt.per]}`;
  }
  return isIndia ? `≈ ${formatInr(opt.listPrice)} per ${opt.per}` : `Billed every ${opt.per}`;
}

function planAriaLabel(opt: Option): string {
  return opt.promo
    ? `${opt.label} plan, ${formatUsd(opt.first)} for your first ${opt.per}, then ${formatUsd(opt.listPrice)} per ${opt.per}`
    : `${opt.label} plan, ${formatUsd(opt.listPrice)} per ${opt.per}`;
}

export function UpgradeModal() {
  const { isOpen, trigger, closeUpgradeModal } = useUpgradeModal();
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const [success, setSuccess] = useState(false);
  const isIndia = useIsIndia();

  useEffect(() => {
    if (isOpen) { setSuccess(false); setBilling("yearly"); setCheckoutError(false); setCheckoutLoading(false); }
  }, [isOpen]);

  // Coming back from checkout with the browser's back button restores this page
  // from the back-forward cache; the button must not stay on "Opening checkout".
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setCheckoutLoading(false);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const headline = HEADLINES[trigger];
  const selected = OPTIONS.find((o) => o.period === billing)!;

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(false);
    try {
      const res = await fetch("/api/billing/checkout-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: billing }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        // Leave the button in its loading state while the browser navigates away.
        window.location.href = data.url;
        return;
      }
    } catch {
      // Network failure: fall through to the inline error.
    }
    setCheckoutError(true);
    setCheckoutLoading(false);
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(v) => { if (!v) closeUpgradeModal(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0C1A0E]/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          data-testid="upgrade-modal"
          aria-describedby={success ? undefined : "upgrade-modal-subtitle"}
          className={cn(
            // Below sm: bottom sheet. Body scrolls, CTA footer stays put.
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[calc(100dvh-16px)] flex-col overflow-hidden rounded-t-3xl bg-[#F7F5F0] text-[#0C1A0E] shadow-[0_24px_64px_rgba(12,26,14,0.35)] outline-none",
            "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            // sm and up: centred 780px modal, plans left, cream unlock column right.
            "sm:inset-0 sm:m-auto sm:grid sm:h-fit sm:max-h-[calc(100dvh-32px)] sm:w-[calc(100vw-32px)] sm:max-w-[780px] sm:grid-cols-[minmax(0,1fr)_340px] sm:grid-rows-[1fr_auto] sm:overflow-y-auto sm:rounded-[20px] sm:bg-white",
            "sm:duration-200 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95"
          )}
        >
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-4 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#E0D8CC] bg-white transition-colors hover:bg-[#F7F5F0] focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#34D399] sm:top-4 sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogPrimitive.Close>

          {success ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 sm:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-success/30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success">
                  <Check className="h-8 w-8 text-white" />
                </div>
              </div>
              <DialogPrimitive.Title className="text-2xl font-bold">You&apos;re on Pro!</DialogPrimitive.Title>
              <p className={cn("text-center text-sm", MUTED)}>Every feature is now available. Refreshing...</p>
            </div>
          ) : (
            <>
              {/* Mobile: one scrolling body. sm+: `contents`, so its children become grid cells. */}
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-2.5 sm:contents">
                <span aria-hidden="true" className="mx-auto block h-1 w-10 shrink-0 rounded-sm bg-[#D6CEC1] sm:hidden" />

                <div className="flex flex-col gap-5 sm:row-span-2 sm:gap-6 sm:p-8">
                  <div className="flex flex-col gap-2 pr-14 sm:pr-10">
                    <span className={cn("inline-flex items-center gap-1.5", CAPS)}>
                      <Crown className="h-3.5 w-3.5 shrink-0 text-[#065F46]" aria-hidden="true" />
                      {headline.eyebrow}
                    </span>
                    <DialogPrimitive.Title className="text-[26px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
                      {headline.title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description id="upgrade-modal-subtitle" className={cn("text-[15px] leading-normal", MUTED)}>
                      {headline.subtitle}
                    </DialogPrimitive.Description>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div role="radiogroup" aria-label="Billing period" className="flex flex-col gap-2">
                      {OPTIONS.map((opt) => {
                        const isSelected = billing === opt.period;
                        return (
                          <label
                            key={opt.period}
                            className={cn(
                              "relative flex min-h-[76px] cursor-pointer items-center gap-3 rounded-[14px] border-2 px-4 py-3.5 transition-colors",
                              "has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#34D399]",
                              isSelected ? "border-[#065F46] bg-[#EEF6F1]" : "border-[#E0D8CC] bg-white hover:border-[#B9B0A2]"
                            )}
                          >
                            <input
                              type="radio"
                              name="upgrade-plan"
                              value={opt.period}
                              checked={isSelected}
                              onChange={() => { setBilling(opt.period); setCheckoutError(false); }}
                              aria-label={planAriaLabel(opt)}
                              className="sr-only"
                            />
                            {isSelected ? (
                              <span aria-hidden="true" className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#065F46]">
                                <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                              </span>
                            ) : (
                              <span aria-hidden="true" className="block h-[22px] w-[22px] shrink-0 rounded-full border-2 border-[#C9C0B2]" />
                            )}
                            <span aria-hidden="true" className="flex min-w-0 flex-1 flex-col gap-1">
                              <span className="flex items-center gap-2">
                                <span className="text-[16px] font-semibold">{opt.label}</span>
                                {opt.popular && (
                                  <span className="rounded-full bg-[#065F46] px-[7px] py-[3px] text-[10px] font-bold uppercase leading-[1.2] tracking-[0.06em] text-white">
                                    Best value
                                  </span>
                                )}
                              </span>
                              <span className={cn("text-[13px]", MUTED)}>{planSubline(opt, isIndia)}</span>
                            </span>
                            <span aria-hidden="true" className="flex shrink-0 flex-col items-end gap-1">
                              {opt.promo && (
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                  <span className={SMALL_PILL}>{opt.promo.percent}% off</span>
                                  <s className={cn("text-[14px] font-medium decoration-[#0C1A0E] decoration-2", MUTED)}>
                                    {formatUsd(opt.listPrice)}/{PER_SHORT[opt.per]}
                                  </s>
                                </span>
                              )}
                              <span className="text-[24px] font-extrabold leading-none tracking-[-0.02em]">
                                {formatUsd(opt.first)}
                                {!opt.promo && <span className={cn("text-[13px] font-medium tracking-normal", MUTED)}>/{PER_SHORT[opt.per]}</span>}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {PROMO && (
                      <p className={cn("mt-0.5 text-[12px] leading-[1.4]", MUTED)}>
                        Intro price covers your first payment. Discount applied automatically at checkout.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 sm:border-l sm:border-[#E0D8CC] sm:bg-[#F7F5F0] sm:px-8 sm:pb-6 sm:pt-8">
                  <span className={CAPS}>What you unlock</span>
                  <ul className="flex flex-col overflow-hidden rounded-[14px] border border-[#E0D8CC] bg-white">
                    {UNLOCKS.map(({ icon: Icon, title, body, pill }, i) => (
                      <li key={title} className={cn("flex items-center gap-3 px-3.5 py-3", i > 0 && "border-t border-[#EFE9DF]")}>
                        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6F1]">
                          <Icon className="h-[18px] w-[18px] text-[#065F46]" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-semibold leading-[1.3]">{title}</span>
                            {pill && <span className={SMALL_PILL}>{pill}</span>}
                          </span>
                          <span className={cn("text-[13px] leading-[1.4]", MUTED)}>{body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <span className={cn("text-[12px] leading-[1.4]", MUTED)}>Plus priority support on every plan.</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2.5 border-t border-[#E0D8CC] bg-[#F7F5F0] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3.5 sm:border-l sm:border-t-0 sm:px-8 sm:pb-8 sm:pt-0">
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="h-[52px] w-full rounded-[14px] bg-[#065F46] text-[16px] font-semibold tracking-[-0.01em] text-white hover:bg-[#065F46] hover:brightness-[0.92] focus-visible:ring-[#34D399]"
                >
                  {checkoutLoading
                    ? "Opening checkout..."
                    : selected.promo
                      ? `Get Pro · ${formatUsd(selected.first)} first ${selected.per}`
                      : `Get Pro · ${formatUsd(selected.listPrice)}/${selected.per}`}
                </Button>
                {checkoutError && (
                  <p role="alert" className="text-center text-[12px] font-medium text-error">
                    Couldn&apos;t open checkout. Try again.
                  </p>
                )}
                <p className={cn("text-center text-[12px] leading-normal", MUTED)}>
                  {selected.promo
                    ? `Tax calculated at checkout. Renews at ${formatUsd(selected.listPrice)}/${selected.per}. Cancel anytime.`
                    : "Tax calculated at checkout. Cancel anytime."}
                </p>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
