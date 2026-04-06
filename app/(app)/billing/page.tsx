import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingPageContent } from "./billing-page-content";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status, subscription_period, subscription_id, current_period_end, created_at")
    .eq("id", user.id)
    .single();

  // Count total CVs ever created (including deleted)
  const { count: totalCvs } = await supabase
    .from("cvs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Count total PDF downloads
  const { count: totalDownloads } = await supabase
    .from("ats_reports")
    .select("id", { count: "exact", head: true })
    .eq("cv_id", user.id);

  // Count total ATS reports
  const { data: cvIds } = await supabase
    .from("cvs")
    .select("id")
    .eq("user_id", user.id);

  let totalReports = 0;
  let totalJobMatches = 0;
  let totalCoverLetters = 0;
  if (cvIds && cvIds.length > 0) {
    const ids = cvIds.map((c) => c.id);

    const { count: reports } = await supabase
      .from("ats_reports")
      .select("id", { count: "exact", head: true })
      .in("cv_id", ids);
    totalReports = reports ?? 0;

    const { count: matches } = await supabase
      .from("job_matches")
      .select("id", { count: "exact", head: true })
      .in("cv_id", ids);
    totalJobMatches = matches ?? 0;

    const { count: letters } = await supabase
      .from("cover_letters")
      .select("id", { count: "exact", head: true })
      .in("cv_id", ids);
    totalCoverLetters = letters ?? 0;
  }

  // Subscription history
  const { data: history } = await supabase
    .from("subscription_history")
    .select("id, plan, period, amount, currency, status, started_at, ended_at")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(10);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <BillingPageContent
        profile={profile ?? {}}
        stats={{
          totalCvs: totalCvs ?? 0,
          totalReports,
          totalJobMatches,
          totalCoverLetters,
        }}
        history={history ?? []}
      />
    </div>
  );
}
