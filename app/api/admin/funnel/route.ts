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

  // Helper for user_activity RPC calls
  const rpc = <T = { count: number }>(name: string) =>
    admin.rpc(name, { from_ts: from, to_ts: to }).single<T>();

  // Helper for page_views RPC calls (date-based, not timestamp)
  const fromDate = from.slice(0, 10);
  const toDate = to.slice(0, 10);
  const pvRpc = (path: string) =>
    admin.rpc("funnel_page_views", { from_date: fromDate, to_date: toDate, page_path: path }).single<{ total: number }>();

  const [
    // Pre-signup (anonymous page views)
    pvHomepage,
    pvPricing,
    pvUpload,
    pvLogin,
    pvResumes,
    // Signup
    signups,
    // Post-signup activity
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
    // Anonymous page views
    pvRpc("/"),
    pvRpc("/pricing"),
    pvRpc("/upload-resume"),
    pvRpc("/login"),
    pvRpc("/resumes"),
    // Signup count
    admin.from("profiles").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to),
    // Post-signup page visits
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

  // Pre-signup: anonymous visitors
  const awareness = [
    { key: "pv_homepage", label: "Homepage", count: Number(pvHomepage.data?.total ?? 0), icon: "home" },
    { key: "pv_resumes", label: "Templates", count: Number(pvResumes.data?.total ?? 0), icon: "file-text" },
    { key: "pv_pricing", label: "Pricing", count: Number(pvPricing.data?.total ?? 0), icon: "credit-card" },
    { key: "pv_upload", label: "Upload Page", count: Number(pvUpload.data?.total ?? 0), icon: "upload" },
    { key: "pv_login", label: "Login Page", count: Number(pvLogin.data?.total ?? 0), icon: "log-in" },
  ];

  // Post-signup: acquisition
  const acquisition = [
    { key: "signups", label: "Signed Up", count: signups.count ?? 0, icon: "user-plus" },
    { key: "visited_dashboard", label: "Dashboard", count: visitedDashboard.data?.count ?? 0, icon: "layout" },
    { key: "visited_upload", label: "Upload Page", count: visitedUpload.data?.count ?? 0, icon: "upload" },
  ];

  // Engagement
  const engagement = [
    { key: "cv_created", label: "CV Created", count: cvCreated.data?.count ?? 0, icon: "file-text" },
    { key: "ats_scanned", label: "ATS Scanned", count: atsScanned.data?.count ?? 0, icon: "scan" },
    { key: "job_matched", label: "Job Match", count: jobMatched.data?.count ?? 0, icon: "briefcase" },
    { key: "cover_letter", label: "Cover Letter", count: coverLetter.data?.count ?? 0, icon: "mail" },
    { key: "pdf_downloaded", label: "Downloaded", count: pdfDownloaded.data?.count ?? 0, icon: "download" },
  ];

  // Conversion
  const conversion = [
    { key: "visited_pricing_auth", label: "Pricing Page", count: visitedPricing.data?.count ?? 0, icon: "credit-card" },
    { key: "upgraded", label: "Upgraded", count: upgraded.count ?? 0, icon: "crown" },
  ];

  const extras = [
    { key: "visited_editor", label: "Opened Editor", count: visitedEditor.data?.count ?? 0 },
    { key: "ai_rewrite", label: "AI Rewrite Used", count: aiRewriteUsed.data?.count ?? 0 },
    { key: "fix_all", label: "Fix All Used", count: fixAllUsed.data?.count ?? 0 },
    { key: "interview_prep", label: "Interview Prep", count: interviewPrep.data?.count ?? 0 },
    { key: "jobs_waitlist", label: "Jobs Waitlist", count: jobsWaitlist.count ?? 0 },
  ];

  return NextResponse.json({ awareness, acquisition, engagement, conversion, extras });
}
