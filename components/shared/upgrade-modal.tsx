"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  download: { title: "Download your CV", subtitle: "Clean, watermark-free PDFs anytime", icon: "zap" },
  ats_limit: { title: "You need more ATS scans", subtitle: "Unlimited analysis to fix every issue", icon: "zap" },
  job_match_limit: { title: "Unlock job matching", subtitle: "Match your CV to any job description", icon: "sparkles" },
  cover_letter_limit: { title: "Generate more cover letters", subtitle: "Tailored letters for every application", icon: "sparkles" },
  ai_rewrite_limit: { title: "More AI rewrites", subtitle: "Polish every bullet point with AI", icon: "sparkles" },
  template_locked: { title: "Unlock all templates", subtitle: "5 professional templates to stand out", icon: "crown" },
  cv_limit: { title: "Create more CVs", subtitle: "Unlimited CVs for different roles", icon: "crown" },
  generic: { title: "Go Pro", subtitle: "Everything you need to land interviews", icon: "crown" },
};

const FEATURES = [
  "Unlimited ATS scans",
  "Unlimited job matches",
  "Unlimited cover letters",
  "Unlimited AI rewrites",
  "All 5 templates",
  "Clean PDF exports",
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
      // Mock upgrade for testing — skip Lemon Squeezy
      // TODO: Replace with real Lemon Squeezy checkout when ready
      const res = await fetch("/api/billing/mock-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: billing }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch { /* ignore */ }
    setCheckoutLoading(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => { if (!v) closeUpgradeModal(); }}>
      <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto p-0">
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 px-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
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
                          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
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
                      <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900 dark:text-green-300 leading-none mt-0.5">
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
                    <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
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
              7-day money back guarantee &middot; Cancel anytime
            </p>
          </div>
        </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
