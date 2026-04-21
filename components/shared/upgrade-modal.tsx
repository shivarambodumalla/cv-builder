"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpgradeModal, type UpgradeTrigger } from "@/context/upgrade-modal-context";

type BillingPeriod = "weekly" | "monthly" | "yearly";

const OPTIONS: { period: BillingPeriod; label: string; original: number; sale: number; per: string; perWeek: string; savePercent: number; popular?: boolean }[] = [
  { period: "weekly", label: "Weekly", original: 10, sale: 5, per: "week", perWeek: "$5.00", savePercent: 50 },
  { period: "monthly", label: "Monthly", original: 35, sale: 14, per: "month", perWeek: "$3.50", savePercent: 60 },
  { period: "yearly", label: "Yearly", original: 420, sale: 120, per: "year", perWeek: "$2.30", savePercent: 71, popular: true },
];

const HEADLINES: Record<UpgradeTrigger, { title: string; subtitle: string; icon: "crown" | "zap" | "sparkles" }> = {
  cv_limit: { title: "You have 3 CVs", subtitle: "Upgrade to create unlimited CVs tailored for different roles.", icon: "crown" },
  ats_limit: { title: "ATS scans used up", subtitle: "Resets in 7 days — or upgrade for unlimited ATS analysis.", icon: "zap" },
  rewrite_limit: { title: "AI rewrites used up", subtitle: "Resets in 7 days — or upgrade for unlimited rewrites.", icon: "sparkles" },
  job_match_limit: { title: "Job matches used up", subtitle: "Resets in 7 days — or upgrade for unlimited matching.", icon: "sparkles" },
  cover_letter_limit: { title: "Cover letters used up", subtitle: "Resets in 7 days — or upgrade for unlimited letters.", icon: "sparkles" },
  fix_all_limit: { title: "Fix All uses reached", subtitle: "Resets Monday — or upgrade for unlimited AI fixes.", icon: "sparkles" },
  cv_tailor_limit: { title: "CV tailoring used this week", subtitle: "Resets Monday — or upgrade for unlimited tailoring.", icon: "sparkles" },
  offer_eval_limit: { title: "Offer evaluations used", subtitle: "Resets Monday — or upgrade for unlimited evaluations.", icon: "sparkles" },
  portfolio_scan_limit: { title: "Portfolio scanning limited", subtitle: "Upgrade to scan unlimited portfolios and GitHub profiles.", icon: "sparkles" },
  story_summary_limit: { title: "Story summaries used", subtitle: "Resets Monday — or upgrade for unlimited AI summaries.", icon: "sparkles" },
  interview_prep_limit: { title: "Interview prep sessions used", subtitle: "Resets Monday — or upgrade for unlimited prep.", icon: "sparkles" },
  template_locked: { title: "All templates included", subtitle: "Every template is free. Upgrade for unlimited ATS scans and matches.", icon: "crown" },
  download: { title: "Download your CV", subtitle: "Your PDF is always clean. Upgrade for unlimited everything else.", icon: "zap" },
  generic: { title: "Upgrade to Pro", subtitle: "Unlimited everything for serious job seekers.", icon: "crown" },
};

const FEATURES = [
  "Unlimited ATS scans",
  "Unlimited AI rewrites",
  "Unlimited job matches",
  "Unlimited cover letters",
  "All 12 templates",
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
              All features unlocked. Refreshing...
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
                      <p className="text-[11px] text-muted-foreground mt-0.5">{opt.perWeek}/week</p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-muted-foreground/50 line-through">${opt.original}</span>
                        <span className="text-xl font-bold">${opt.sale}</span>
                      </div>
                      <span className="inline-block rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success leading-none mt-0.5">
                        SAVE {opt.savePercent}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tax note */}
            <p className="text-[10px] text-muted-foreground/60 text-center">
              Prices exclude applicable taxes (GST/VAT). Tax will be calculated at checkout.
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
              {checkoutLoading ? "Processing..." : `Get Pro \u2014 $${selected.sale}/${selected.per}`}
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
