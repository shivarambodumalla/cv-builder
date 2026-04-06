import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { UserActions } from "./user-actions";

export const metadata: Metadata = {
  title: "User Detail — CVEdge Admin",
};

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, subscription_status, subscription_period, subscription_id, current_period_end, created_at, ats_scans_this_month, job_matches_this_month, cover_letters_this_month, ai_rewrites_this_month, pdf_downloads_this_week")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: userCvs } = await supabase
    .from("cvs")
    .select("id, updated_at")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  const cvIds = (userCvs ?? []).map((c) => c.id);
  const cvsCount = cvIds.length;
  const lastActive = userCvs?.[0]?.updated_at || null;

  let atsCount = 0;
  let jobMatchCount = 0;
  let coverLetterCount = 0;

  if (cvIds.length > 0) {
    const [ats, jm, cl] = await Promise.all([
      supabase.from("ats_reports").select("*", { count: "exact", head: true }).in("cv_id", cvIds),
      supabase.from("job_matches").select("*", { count: "exact", head: true }).in("cv_id", cvIds),
      supabase.from("cover_letters").select("*", { count: "exact", head: true }).in("cv_id", cvIds),
    ]);
    atsCount = ats.count ?? 0;
    jobMatchCount = jm.count ?? 0;
    coverLetterCount = cl.count ?? 0;
  }

  // Subscription history
  const { data: history } = await supabase
    .from("subscription_history")
    .select("id, plan, period, amount, currency, status, started_at, ended_at")
    .eq("user_id", id)
    .order("started_at", { ascending: false })
    .limit(10);

  const renewalDate = profile.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const statusColor =
    profile.subscription_status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : profile.subscription_status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    : "bg-muted text-muted-foreground";

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {profile.full_name || profile.email}
      </h1>

      <div className="space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-mono text-xs">{profile.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{profile.full_name || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last Active</dt>
                <dd className="font-medium">
                  {lastActive ? new Date(lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Subscription</CardTitle>
              <Badge variant="secondary" className={statusColor}>
                {profile.subscription_status === "active" ? "Active" : profile.subscription_status === "cancelled" ? "Cancelled" : "Free"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium capitalize">{profile.plan}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Billing Period</dt>
                <dd className="font-medium capitalize">{profile.subscription_period || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Subscription ID</dt>
                <dd className="font-mono text-xs">{profile.subscription_id || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{profile.subscription_status === "cancelled" ? "Access Until" : "Renews On"}</dt>
                <dd className="font-medium">{renewalDate || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity &amp; Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">CVs Created</dt>
                <dd className="text-lg font-bold">{cvsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ATS Reports</dt>
                <dd className="text-lg font-bold">{atsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Job Matches</dt>
                <dd className="text-lg font-bold">{jobMatchCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cover Letters</dt>
                <dd className="text-lg font-bold">{coverLetterCount}</dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <p className="text-xs font-medium text-muted-foreground mb-2">This month&apos;s usage</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-5">
              <div><dt className="text-muted-foreground text-xs">ATS</dt><dd className="font-medium">{profile.ats_scans_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Matches</dt><dd className="font-medium">{profile.job_matches_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Letters</dt><dd className="font-medium">{profile.cover_letters_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Rewrites</dt><dd className="font-medium">{profile.ai_rewrites_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">PDFs</dt><dd className="font-medium">{profile.pdf_downloads_this_week ?? 0}</dd></div>
            </dl>
          </CardContent>
        </Card>

        {/* Subscription History */}
        {(history ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Period</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(history ?? []).map((h) => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="px-6 py-2 capitalize">{h.plan}</td>
                      <td className="px-6 py-2 capitalize">{h.period}</td>
                      <td className="px-6 py-2">${h.amount}</td>
                      <td className="px-6 py-2 text-muted-foreground">
                        {new Date(h.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {h.status === "mock" ? "Active" : h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        <UserActions
          userId={profile.id}
          userEmail={profile.email}
          currentPlan={profile.plan}
          subscriptionStatus={profile.subscription_status || "free"}
          subscriptionId={profile.subscription_id}
        />
      </div>
    </div>
  );
}
