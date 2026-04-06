"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/lib/billing/limits";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { Crown, FileText, BarChart3, Briefcase, Mail, Sparkles, Download, Calendar, Receipt } from "lucide-react";

interface ProfileData {
  plan?: string;
  subscription_status?: string;
  subscription_period?: string;
  subscription_id?: string;
  current_period_end?: string;
  created_at?: string;
}

interface Stats {
  totalCvs: number;
  totalReports: number;
  totalJobMatches: number;
  totalCoverLetters: number;
}

interface HistoryEntry {
  id: string;
  plan: string;
  period: string;
  amount: number;
  currency: string;
  status: string;
  started_at: string;
  ended_at: string | null;
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function BillingPageContent({ profile, stats, history }: { profile: ProfileData; stats: Stats; history: HistoryEntry[] }) {
  const plan = getPlan(profile);
  const { openUpgradeModal } = useUpgradeModal();

  const periodLabel = profile.subscription_period
    ? profile.subscription_period.charAt(0).toUpperCase() + profile.subscription_period.slice(1)
    : null;

  const periodEnd = profile.current_period_end ? new Date(profile.current_period_end) : null;
  const renewalDate = periodEnd
    ? periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const daysLeft = periodEnd ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="space-y-6">
      {/* Upgrade banner for free users */}
      {plan === "free" && (
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Upgrade to CVEdge Pro</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Unlimited ATS scans, job matching, all templates, and more.
              <br />
              <span className="font-medium text-foreground">Starting at $2.30/week</span>
            </p>
          </div>
          <Button onClick={() => openUpgradeModal("generic")} className="shrink-0">
            Upgrade
          </Button>
        </div>
      )}

      {/* Subscription card */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {plan === "pro" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{plan === "pro" ? "CVEdge Pro" : "Free Plan"}</h2>
              {periodLabel && <p className="text-sm text-muted-foreground">{periodLabel} billing</p>}
            </div>
          </div>
          <Badge variant="secondary" className={
            profile.subscription_status === "cancelled"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : plan === "pro"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : ""
          }>
            {profile.subscription_status === "cancelled" ? "Cancelled" : plan === "pro" ? "Active" : "Free"}
          </Badge>
        </div>

        {/* Subscription details */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {plan === "pro" && renewalDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">
                  {profile.subscription_status === "cancelled" ? "Access until" : "Renews on"}
                </p>
                <p className="font-medium">{renewalDate}</p>
              </div>
            </div>
          )}
          {plan === "pro" && daysLeft !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Days remaining</p>
                <p className="font-medium">{daysLeft} days</p>
              </div>
            </div>
          )}
          {memberSince && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Member since</p>
                <p className="font-medium">{memberSince}</p>
              </div>
            </div>
          )}
        </div>

        {/* Invoice note */}
        {plan === "pro" && (
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-muted-foreground">
              Invoices are sent to your email after each payment. For billing questions, contact{" "}
              <a href="mailto:hello@thecvedge.com" className="text-primary hover:underline">hello@thecvedge.com</a>
            </p>
          </div>
        )}
      </div>

      {/* Activity stats */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your activity</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={FileText} label="CVs created" value={stats.totalCvs} />
          <StatCard icon={BarChart3} label="ATS reports" value={stats.totalReports} />
          <StatCard icon={Briefcase} label="Job matches" value={stats.totalJobMatches} />
          <StatCard icon={Mail} label="Cover letters" value={stats.totalCoverLetters} />
        </div>
      </div>

      {/* What's included */}
      {plan === "free" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">Free plan includes</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" /> 1 CV
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" /> 3 ATS scans/month
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" /> 1 job match/month
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> 1 cover letter/month
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" /> 5 AI rewrites/month
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-4 w-4" /> 1 PDF download/week
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => openUpgradeModal("generic")}>
            Compare with Pro
          </Button>
        </div>
      )}

      {plan === "pro" && (
        <div className="rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">Pro plan includes</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Unlimited CVs
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> 100 ATS scans/month
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> 100 job matches/month
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> 100 cover letters/month
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> 200 AI rewrites/month
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Unlimited PDF downloads
            </div>
          </div>
        </div>
      )}

      {/* Subscription history */}
      {history.length > 0 && (
        <div className="rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">Subscription history</h3>
          <div className="space-y-0 divide-y">
            {history.map((h) => {
              const startDate = new Date(h.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const endDate = h.ended_at ? new Date(h.ended_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
              const statusColor = h.status === "active" || h.status === "mock"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : h.status === "cancelled"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-muted text-muted-foreground";
              return (
                <div key={h.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {h.plan.charAt(0).toUpperCase() + h.plan.slice(1)} &middot; {h.period.charAt(0).toUpperCase() + h.period.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {startDate}{endDate ? ` \u2013 ${endDate}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${h.amount}</span>
                    <Badge variant="secondary" className={statusColor}>
                      {h.status === "mock" ? "Active" : h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
