"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlan, PLAN_LIMITS } from "@/lib/billing/limits";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { Crown } from "lucide-react";

interface ProfileData {
  plan?: string;
  subscription_status?: string;
  subscription_period?: string;
  subscription_id?: string;
  current_period_end?: string;
  ats_scans_this_month?: number;
  job_matches_this_month?: number;
  cover_letters_this_month?: number;
  ai_rewrites_this_month?: number;
  pdf_downloads_this_week?: number;
  usage_reset_date?: string;
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {isUnlimited ? `${used} used` : `${used}/${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BillingPageContent({ profile }: { profile: ProfileData }) {
  const plan = getPlan(profile);
  const limits = PLAN_LIMITS[plan];
  const { openUpgradeModal } = useUpgradeModal();

  const periodLabel = profile.subscription_period
    ? profile.subscription_period.charAt(0).toUpperCase() + profile.subscription_period.slice(1)
    : null;

  const renewalDate = profile.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="space-y-8">
      {/* Current plan */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {plan === "pro" && <Crown className="h-5 w-5 text-amber-500" />}
            <div>
              <h2 className="text-xl font-bold">{plan === "pro" ? "CVEdge Pro" : "Free Plan"}</h2>
              {periodLabel && <p className="text-sm text-muted-foreground">{periodLabel} billing</p>}
            </div>
          </div>
          <Badge variant="secondary" className={plan === "pro" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" : ""}>
            {profile.subscription_status === "cancelled" ? "Cancelled" : plan === "pro" ? "Active" : "Free"}
          </Badge>
        </div>

        {profile.subscription_status === "cancelled" && renewalDate && (
          <p className="text-sm text-muted-foreground">Pro access until {renewalDate}</p>
        )}

        {plan === "pro" && renewalDate && profile.subscription_status === "active" && (
          <p className="text-sm text-muted-foreground">Next renewal: {renewalDate}</p>
        )}

        {plan === "free" && (
          <Button onClick={() => openUpgradeModal("generic")}>
            Upgrade to Pro
          </Button>
        )}
      </div>

      {/* Usage */}
      <div className="rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold">Usage this month</h3>
        <div className="space-y-3">
          <UsageBar label="ATS scans" used={profile.ats_scans_this_month ?? 0} limit={limits.ats_scans} />
          <UsageBar label="Job matches" used={profile.job_matches_this_month ?? 0} limit={limits.job_matches} />
          <UsageBar label="Cover letters" used={profile.cover_letters_this_month ?? 0} limit={limits.cover_letters} />
          <UsageBar label="AI rewrites" used={profile.ai_rewrites_this_month ?? 0} limit={limits.ai_rewrites} />
          <UsageBar label="PDF downloads (this week)" used={profile.pdf_downloads_this_week ?? 0} limit={limits.pdf_downloads_per_week} />
        </div>
      </div>

      {plan === "free" && (
        <div className="rounded-xl border-2 border-primary p-6 text-center space-y-3">
          <h3 className="text-lg font-bold">Upgrade to CVEdge Pro</h3>
          <p className="text-sm text-muted-foreground">Unlimited ATS scans, 100 job matches, all templates, and more.</p>
          <Button onClick={() => openUpgradeModal("generic")} size="lg">
            Get Pro &rarr;
          </Button>
        </div>
      )}
    </div>
  );
}
