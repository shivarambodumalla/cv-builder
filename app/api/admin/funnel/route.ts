import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { EXCLUDED_USER_IDS } from "@/lib/admin/constants";

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
  ] = await Promise.all([
    // Anonymous page views
    pvRpc("/"),
    pvRpc("/pricing"),
    pvRpc("/upload-resume"),
    pvRpc("/login"),
    pvRpc("/resumes"),
    // Signup count (excluding test users)
    admin.from("profiles").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to)
      .not("id", "in", `(${EXCLUDED_USER_IDS.join(",")})`),
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
  ];

  // ── Popup metrics (tracked via page_views for anonymous, user_activity for auth) ──
  const popupPaths = [
    { id: "score_teaser", label: "Score Teaser" },
    { id: "download_nudge", label: "Download Nudge" },
    { id: "jobs_discovery", label: "Jobs Discovery" },
    { id: "signup_modal", label: "Signup Modal" },
  ];
  const popupResults = await Promise.all(
    popupPaths.flatMap(p => [
      pvRpc(`/popup/shown/${p.id}`),
      pvRpc(`/popup/click/${p.id}`),
      pvRpc(`/popup/dismiss/${p.id}`),
    ])
  );
  const popups = popupPaths.map((p, i) => ({
    id: p.id,
    label: p.label,
    shown: Number(popupResults[i * 3].data?.total ?? 0),
    clicked: Number(popupResults[i * 3 + 1].data?.total ?? 0),
    dismissed: Number(popupResults[i * 3 + 2].data?.total ?? 0),
    conversionPct: Number(popupResults[i * 3].data?.total ?? 0) > 0
      ? Math.round((Number(popupResults[i * 3 + 1].data?.total ?? 0) / Number(popupResults[i * 3].data?.total ?? 0)) * 100)
      : 0,
  }));

  // ── Page-level visits (public + private) ──
  // Public pages (anonymous aggregate counts from page_views table)
  const publicPaths = ["/", "/pricing", "/upload-resume", "/login", "/register", "/resumes", "/interview-prep", "/jobs"];
  const publicVisitPromises = publicPaths.map(p => pvRpc(p));
  const publicVisitResults = await Promise.all(publicVisitPromises);

  const publicPageVisits = publicPaths.map((path, i) => ({
    path,
    label: path === "/" ? "Homepage" : path.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    count: Number(publicVisitResults[i].data?.total ?? 0),
    type: "public" as const,
  }));

  // Private pages (distinct users from page_sessions table)
  const privatePaths = ["/dashboard", "/my-jobs", "/interview-coach", "/billing", "/settings"];
  const privateVisitResults = await Promise.all(
    privatePaths.map(path =>
      admin
        .from("page_sessions")
        .select("user_id", { count: "exact", head: true })
        .like("path", `${path}%`)
        .gte("created_at", from)
        .lte("created_at", to)
        .not("user_id", "in", `(${EXCLUDED_USER_IDS.join(",")})`)
    )
  );

  const privatePageVisits = privatePaths.map((path, i) => ({
    path,
    label: path.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    count: privateVisitResults[i].count ?? 0,
    type: "private" as const,
  }));

  const pageVisits = [...publicPageVisits, ...privatePageVisits].sort((a, b) => b.count - a.count);

  // Total anonymous visits (sum of all public page views)
  const totalAnonVisits = publicPageVisits.reduce((sum, p) => sum + p.count, 0);

  // ── Bounce analysis: public pages that don't lead to login/signup ──
  const loginViews = Number(pvLogin.data?.total ?? 0);
  const signupCount = signups.count ?? 0;
  const bounceAnalysis = publicPageVisits
    .filter(pv => pv.path !== "/login" && pv.path !== "/register" && pv.count > 0)
    .map(pv => {
      // Bounce = visitors who saw this page but never reached login
      // Approximation: if login views are much lower than this page's views, most bounced
      const reachLoginPct = pv.count > 0 ? Math.min(100, Math.round((loginViews / pv.count) * 100)) : 0;
      const bouncePct = Math.max(0, 100 - reachLoginPct);
      return { path: pv.path, label: pv.label, views: pv.count, bouncePct, reachLoginPct };
    })
    .sort((a, b) => b.bouncePct - a.bouncePct);

  // ── Signup sources: which page did new users visit first after signing up ──
  // Find first page_session for users who signed up in the date range
  let signupSources: { page: string; count: number; pct: number }[] = [];
  if (signupCount > 0) {
    const signupIds = (await admin.from("profiles").select("id").gte("created_at", from).lte("created_at", to).not("id", "in", `(${EXCLUDED_USER_IDS.join(",")})`)).data?.map(r => r.id) ?? [];
    const { data: firstSessions } = await admin
      .from("page_sessions")
      .select("user_id, path")
      .in("user_id", signupIds)
      .gte("created_at", from)
      .lte("created_at", to)
      .order("entered_at", { ascending: true });

    // Group by user, take the first session path for each
    const userFirstPage = new Map<string, string>();
    for (const s of firstSessions ?? []) {
      if (!userFirstPage.has(s.user_id)) {
        userFirstPage.set(s.user_id, s.path);
      }
    }

    // Count occurrences of each first page
    const pageCounts = new Map<string, number>();
    for (const page of userFirstPage.values()) {
      // Normalize: /resume/xxx → /resume, /my-jobs/saved → /my-jobs
      const normalized = page.replace(/\/[0-9a-f-]{36}/g, "").replace(/\/saved$/, "") || page;
      pageCounts.set(normalized, (pageCounts.get(normalized) ?? 0) + 1);
    }

    signupSources = [...pageCounts.entries()]
      .map(([page, count]) => ({
        page,
        count,
        pct: Math.round((count / signupCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // ── Jobs funnel ──
  const pvJobs = Number((await pvRpc("/jobs")).data?.total ?? 0);
  const jobsPageAuth = visitedEditor.data?.count ?? 0; // reuse "Opened jobs page" event
  const [jobSearches, jobClicks, jobSaves] = await Promise.all([
    admin.from("user_activity").select("id", { count: "exact", head: true })
      .eq("event", "Opened jobs page").gte("created_at", from).lte("created_at", to),
    admin.from("job_clicks").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to),
    admin.from("saved_jobs").select("id", { count: "exact", head: true })
      .gte("saved_at", from).lte("saved_at", to),
  ]);

  const jobsFunnel = [
    { key: "jobs_page_anon", label: "Jobs Page (public)", count: pvJobs },
    { key: "jobs_page_auth", label: "Jobs Page (logged in)", count: jobSearches.count ?? 0 },
    { key: "job_clicks", label: "Job Clicks (Apply)", count: jobClicks.count ?? 0 },
    { key: "job_saves", label: "Jobs Saved", count: jobSaves.count ?? 0 },
  ];

  // ── Interview Prep funnel ──
  const pvInterviewPrep = Number((await pvRpc("/interview-prep")).data?.total ?? 0);
  const [storyCount, qualityScoredCount, prepUsedCount] = await Promise.all([
    admin.from("stories").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to),
    admin.from("stories").select("id", { count: "exact", head: true })
      .not("quality_score", "is", null).gte("created_at", from).lte("created_at", to),
    admin.from("user_activity").select("id", { count: "exact", head: true })
      .eq("event", "Opened interview coach").gte("created_at", from).lte("created_at", to),
  ]);

  const interviewFunnel = [
    { key: "interview_page_anon", label: "Coach Page (public)", count: pvInterviewPrep },
    { key: "interview_page_auth", label: "Coach Page (logged in)", count: prepUsedCount.count ?? 0 },
    { key: "stories_created", label: "Stories Created", count: storyCount.count ?? 0 },
    { key: "stories_scored", label: "Quality Scored", count: qualityScoredCount.count ?? 0 },
  ];

  // ── Anonymous → Signup funnel ──
  const anonToSignup = [
    { key: "anon_visitors", label: "Anonymous Visitors", count: totalAnonVisits },
    { key: "anon_login_page", label: "Reached Login", count: Number(pvLogin.data?.total ?? 0) },
    { key: "signed_up", label: "Signed Up", count: signupCount },
  ];

  // ── Login → Download funnel ──
  const loginToDownload = [
    { key: "signed_up_logged_in", label: "Signed Up", count: signupCount },
    { key: "cv_created_ltd", label: "CV Created", count: cvCreated.data?.count ?? 0 },
    { key: "ats_scanned_ltd", label: "ATS Scanned", count: atsScanned.data?.count ?? 0 },
    { key: "pdf_downloaded_ltd", label: "Downloaded PDF", count: pdfDownloaded.data?.count ?? 0 },
  ];

  // ── Visits over time (anonymous page_views aggregated by view_date) ──
  const { data: visitRows } = await admin
    .from("page_views")
    .select("view_date, count")
    .gte("view_date", fromDate)
    .lte("view_date", toDate);

  const byDate = new Map<string, number>();
  for (const r of visitRows ?? []) {
    const d = (r as { view_date: string; count: number }).view_date;
    byDate.set(d, (byDate.get(d) ?? 0) + (r as { count: number }).count);
  }

  // Fill gaps with 0 so the chart has a continuous x-axis
  const visitsOverTime: { date: string; count: number }[] = [];
  const start = new Date(fromDate + "T00:00:00Z");
  const end = new Date(toDate + "T00:00:00Z");
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    visitsOverTime.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  // Signups over time (for overlaying on the chart)
  const { data: signupRows } = await admin
    .from("profiles")
    .select("created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .not("id", "in", `(${EXCLUDED_USER_IDS.join(",")})`);

  const signupsByDate = new Map<string, number>();
  for (const r of signupRows ?? []) {
    const d = (r as { created_at: string }).created_at.slice(0, 10);
    signupsByDate.set(d, (signupsByDate.get(d) ?? 0) + 1);
  }
  const signupsOverTime = visitsOverTime.map(v => ({ date: v.date, count: signupsByDate.get(v.date) ?? 0 }));

  return NextResponse.json({
    awareness,
    acquisition,
    engagement,
    conversion,
    extras,
    jobsFunnel,
    interviewFunnel,
    anonToSignup,
    loginToDownload,
    pageVisits,
    totalAnonVisits,
    newSignups: signupCount,
    bounceAnalysis,
    signupSources,
    popups,
    visitsOverTime,
    signupsOverTime,
  });
}
