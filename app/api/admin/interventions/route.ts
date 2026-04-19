import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

// All intervention IDs we track
const SIGNUP_MODALS = [
  { id: "signup_timed", label: "Timed Modal" },
  { id: "signup_template_click", label: "Template Click" },
  { id: "signup_job_search", label: "Job Search" },
  { id: "signup_role_page", label: "Role Page" },
  { id: "signup_resumes_cta", label: "Resumes CTA" },
  { id: "signup_jobs_cta", label: "Jobs CTA" },
  { id: "signup_exit_intent", label: "Exit Intent" },
];

const POPOVERS = [
  { id: "download_nudge", label: "Download Nudge" },
  { id: "jobs_discovery", label: "Jobs Discovery" },
  { id: "upload_cv", label: "Upload CV" },
  { id: "return_visit", label: "Return Visit" },
];

const INLINE = [
  { id: "ats_scan_dot", label: "ATS Scan Dot" },
  { id: "job_match_nudge", label: "Job Match Nudge" },
  { id: "story_nudge", label: "Story Nudge" },
];

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const admin = createAdminClient();
  const fromDate = from.slice(0, 10);
  const toDate = to.slice(0, 10);

  // Helper: count page_views matching a path pattern (for anonymous tracking)
  const pvCount = async (path: string) => {
    const { data } = await admin.rpc("funnel_page_views", { from_date: fromDate, to_date: toDate, page_path: path }).single<{ total: number }>();
    return Number(data?.total ?? 0);
  };

  // Helper: count user_activity events matching a pattern (for authenticated tracking)
  const actCount = async (eventPattern: string) => {
    const { count } = await admin
      .from("user_activity")
      .select("id", { count: "exact", head: true })
      .like("event", `${eventPattern}%`)
      .gte("created_at", from)
      .lte("created_at", to);
    return count ?? 0;
  };

  // Fetch all metrics in parallel
  const results = await Promise.all([
    // Signup modals — tracked via page_views with /popup/shown|click|dismiss/signup_[trigger]
    ...SIGNUP_MODALS.flatMap(m => [
      pvCount(`/popup/shown/${m.id}`),
      pvCount(`/popup/click/${m.id}`),
      pvCount(`/popup/dismiss/${m.id}`),
    ]),
    // Popovers — tracked via user_activity with popover_shown|click|dismiss:[id]
    ...POPOVERS.flatMap(m => [
      actCount(`popover_shown:${m.id}`),
      actCount(`popover_click:${m.id}`),
      actCount(`popover_dismiss:${m.id}`),
    ]),
    // Inline — tracked via user_activity
    ...INLINE.flatMap(m => [
      actCount(`popover_shown:${m.id}`),
      actCount(`popover_click:${m.id}`),
      actCount(`popover_dismiss:${m.id}`),
    ]),
  ]);

  // Parse results into structured data
  const interventions: { id: string; label: string; category: string; shown: number; clicked: number; dismissed: number; conversionPct: number }[] = [];
  let idx = 0;

  for (const m of SIGNUP_MODALS) {
    const shown = results[idx++];
    const clicked = results[idx++];
    const dismissed = results[idx++];
    interventions.push({ id: m.id, label: m.label, category: "signup_modal", shown, clicked, dismissed, conversionPct: shown > 0 ? Math.round((clicked / shown) * 100) : 0 });
  }
  for (const m of POPOVERS) {
    const shown = results[idx++];
    const clicked = results[idx++];
    const dismissed = results[idx++];
    interventions.push({ id: m.id, label: m.label, category: "popover", shown, clicked, dismissed, conversionPct: shown > 0 ? Math.round((clicked / shown) * 100) : 0 });
  }
  for (const m of INLINE) {
    const shown = results[idx++];
    const clicked = results[idx++];
    const dismissed = results[idx++];
    interventions.push({ id: m.id, label: m.label, category: "inline", shown, clicked, dismissed, conversionPct: shown > 0 ? Math.round((clicked / shown) * 100) : 0 });
  }

  const totalShown = interventions.reduce((s, i) => s + i.shown, 0);
  const totalClicked = interventions.reduce((s, i) => s + i.clicked, 0);
  const totalDismissed = interventions.reduce((s, i) => s + i.dismissed, 0);

  return NextResponse.json({
    interventions,
    totals: {
      shown: totalShown,
      clicked: totalClicked,
      dismissed: totalDismissed,
      conversionPct: totalShown > 0 ? Math.round((totalClicked / totalShown) * 100) : 0,
    },
  });
}
