import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const rpc = <T = { count: number }>(name: string) =>
    admin.rpc(name, { from_ts: from, to_ts: to }).single<T>();

  const [
    signups,
    visitedDashboard,
    visitedUpload,
    cvCreated,
    visitedEditor,
    atsScanned,
    aiRewriteUsed,
    fixAllUsed,
    jobMatched,
    coverLetter,
    pdfDownloaded,
    visitedPricing,
    upgraded,
    interviewPrep,
    jobsWaitlist,
  ] = await Promise.all([
    // Signup count
    admin.from("profiles").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to),
    // Page visits
    rpc("funnel_visited_dashboard"),
    rpc("funnel_visited_upload"),
    // Core funnel
    rpc("funnel_cv_created"),
    rpc("funnel_visited_editor"),
    rpc("funnel_ats_scanned"),
    rpc("funnel_ai_rewrite_used"),
    rpc("funnel_fix_all_used"),
    rpc("funnel_job_matched"),
    rpc("funnel_cover_letter"),
    rpc("funnel_pdf_downloaded"),
    // Conversion
    rpc("funnel_visited_pricing"),
    admin.from("subscription_history").select("id", { count: "exact", head: true })
      .eq("plan", "pro").in("status", ["active", "cancelled", "expired"])
      .gte("started_at", from).lte("started_at", to),
    // Extras
    rpc("funnel_interview_prep"),
    admin.from("job_waitlist").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to),
  ]);

  // Main funnel: full user journey
  const acquisition = [
    { key: "signups", label: "Signed Up", count: signups.count ?? 0, icon: "user-plus" },
    { key: "visited_dashboard", label: "Visited Dashboard", count: visitedDashboard.data?.count ?? 0, icon: "layout" },
    { key: "visited_upload", label: "Visited Upload Page", count: visitedUpload.data?.count ?? 0, icon: "upload" },
  ];

  const engagement = [
    { key: "cv_created", label: "CV Created", count: cvCreated.data?.count ?? 0, icon: "file-text" },
    { key: "visited_editor", label: "Opened Editor", count: visitedEditor.data?.count ?? 0, icon: "edit" },
    { key: "ats_scanned", label: "ATS Scanned", count: atsScanned.data?.count ?? 0, icon: "scan" },
    { key: "ai_rewrite", label: "Used AI Rewrite", count: aiRewriteUsed.data?.count ?? 0, icon: "sparkles" },
    { key: "fix_all", label: "Used Fix All", count: fixAllUsed.data?.count ?? 0, icon: "wand" },
    { key: "job_matched", label: "Job Matched", count: jobMatched.data?.count ?? 0, icon: "briefcase" },
    { key: "cover_letter", label: "Cover Letter", count: coverLetter.data?.count ?? 0, icon: "mail" },
    { key: "pdf_downloaded", label: "PDF Downloaded", count: pdfDownloaded.data?.count ?? 0, icon: "download" },
  ];

  const conversion = [
    { key: "visited_pricing", label: "Visited Pricing", count: visitedPricing.data?.count ?? 0, icon: "credit-card" },
    { key: "upgraded", label: "Upgraded to Pro", count: upgraded.count ?? 0, icon: "crown" },
  ];

  const extras = [
    { key: "interview_prep", label: "Interview Prep", count: interviewPrep.data?.count ?? 0 },
    { key: "jobs_waitlist", label: "Jobs Waitlist", count: jobsWaitlist.count ?? 0 },
  ];

  return NextResponse.json({ acquisition, engagement, conversion, extras });
}
