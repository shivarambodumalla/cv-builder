"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpgradeModal, type UpgradeTrigger } from "@/context/upgrade-modal-context";
import { createClient } from "@/lib/supabase/client";

type BillingPeriod = "weekly" | "monthly" | "yearly";

const PRICING: Record<BillingPeriod, { original: number; sale: number; save: string; perWeek?: string; period: string; urgency?: string }> = {
  weekly: { original: 10, sale: 5, save: "50%", period: "/week" },
  monthly: { original: 35, sale: 14, save: "60%", perWeek: "$3.50/week", period: "/month" },
  yearly: { original: 420, sale: 120, save: "71%", perWeek: "$2.30/week", period: "/year", urgency: "Launch pricing — increases soon" },
};

const HEADLINES: Record<UpgradeTrigger, { title: string; subtitle: string }> = {
  download: { title: "Download your CV", subtitle: "Upgrade to download clean, watermark-free PDFs anytime" },
  ats_limit: { title: "You've used all free ATS scans", subtitle: "Get unlimited ATS analysis and fix every issue holding you back" },
  job_match_limit: { title: "Unlock job matching", subtitle: "Match your CV to any job description and close the gap fast" },
  cover_letter_limit: { title: "Generate more cover letters", subtitle: "Create tailored cover letters for every application" },
  ai_rewrite_limit: { title: "More AI rewrites", subtitle: "Polish every bullet point with AI-powered suggestions" },
  template_locked: { title: "Unlock all templates", subtitle: "Access all 5 professional templates to stand out" },
  cv_limit: { title: "Create more CVs", subtitle: "Build unlimited CVs for different roles and opportunities" },
  generic: { title: "Upgrade to CVEdge Pro", subtitle: "Unlock the full power of AI-driven CV optimization" },
};

const FEATURES_BY_TRIGGER: Record<UpgradeTrigger, string[]> = {
  ats_limit: ["Unlimited ATS scans", "100 job matches/month", "AI bullet rewrites (200/month)", "All 5 templates", "Clean PDF downloads", "100 cover letters/month"],
  job_match_limit: ["100 job matches/month", "Unlimited ATS scans", "100 cover letters/month", "AI bullet rewrites (200/month)", "All 5 templates", "Clean PDF downloads"],
  cover_letter_limit: ["100 cover letters/month", "100 job matches/month", "Unlimited ATS scans", "AI bullet rewrites (200/month)", "All 5 templates", "Clean PDF downloads"],
  ai_rewrite_limit: ["AI bullet rewrites (200/month)", "Unlimited ATS scans", "100 job matches/month", "100 cover letters/month", "All 5 templates", "Clean PDF downloads"],
  template_locked: ["All 5 templates", "Unlimited ATS scans", "100 job matches/month", "Clean PDF downloads", "AI bullet rewrites (200/month)", "100 cover letters/month"],
  download: ["Clean PDF downloads", "Unlimited ATS scans", "All 5 templates", "100 job matches/month", "AI bullet rewrites (200/month)", "100 cover letters/month"],
  cv_limit: ["Unlimited CVs", "Unlimited ATS scans", "100 job matches/month", "All 5 templates", "Clean PDF downloads", "100 cover letters/month"],
  generic: ["Unlimited ATS scans", "100 job matches/month", "100 cover letters/month", "AI bullet rewrites (200/month)", "All 5 templates", "Clean PDF downloads"],
};

export function UpgradeModal() {
  const { isOpen, trigger, closeUpgradeModal } = useUpgradeModal();
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const [, setUserEmail] = useState("");
  const [, setUserId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.id);
      }
    });
  }, []);

  // Reset success when modal reopens
  useEffect(() => {
    if (isOpen) setSuccess(false);
  }, [isOpen]);

  const pro = PRICING[billing];
  const headline = HEADLINES[trigger];
  const features = FEATURES_BY_TRIGGER[trigger];

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      // TODO: Replace with real Lemon Squeezy checkout when ready
      // For now: mock purchase — directly upgrade user in DB
      const res = await fetch("/api/billing/mock-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: billing }),
      });
      if (res.ok) {
        setSuccess(true);
        // Refresh page data after short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch {
      // ignore
    }
    setCheckoutLoading(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => { if (!v) closeUpgradeModal(); }}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold">You&apos;re on Pro!</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              All features unlocked. Refreshing...
            </p>
          </div>
        ) : (
        <>
        <SheetHeader className="pr-6">
          <SheetTitle className="text-xl">{headline.title}</SheetTitle>
          <p className="text-sm text-muted-foreground">{headline.subtitle}</p>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-1">
          {/* Billing toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            {(["weekly", "monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setBilling(p)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  billing === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p === "yearly" ? "Yearly" : p === "monthly" ? "Monthly" : "Weekly"}
                {p === "yearly" && <span className="ml-1 text-[10px]">Best</span>}
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-muted-foreground line-through">${pro.original}</span>
              <span className="text-3xl font-bold">${pro.sale}</span>
              <span className="text-muted-foreground">{pro.period}</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                SAVE {pro.save}
              </span>
              {pro.perWeek && (
                <span className="text-xs text-muted-foreground">{pro.perWeek}</span>
              )}
            </div>
            {pro.urgency && (
              <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">{pro.urgency}</p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button className="w-full h-11 text-base" onClick={handleCheckout} disabled={checkoutLoading}>
            {checkoutLoading ? "Loading..." : "Get Pro →"}
          </Button>

          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">7-day money back guarantee</p>
            <p className="text-xs text-muted-foreground">Cancel anytime</p>
          </div>

          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <p>Questions? <a href="mailto:hello@thecvedge.com" className="text-primary hover:underline">hello@thecvedge.com</a></p>
          </div>
        </div>
        </>
        )}
      </SheetContent>
    </Sheet>
  );
}
