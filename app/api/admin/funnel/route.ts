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

  // All queries use DISTINCT user counts within the date range
  const [
    signups,
    cvCreated,
    atsScanned,
    jobMatched,
    coverLetter,
    pdfDownloaded,
    upgraded,
    interviewPrep,
    jobsWaitlist,
  ] = await Promise.all([
    // 1. Signups
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", from)
      .lte("created_at", to),

    // 2. CV Created (distinct users)
    admin.rpc("funnel_cv_created", { from_ts: from, to_ts: to }).single<{ count: number }>(),

    // 3. ATS Scanned (distinct users)
    admin.rpc("funnel_ats_scanned", { from_ts: from, to_ts: to }).single<{ count: number }>(),

    // 4. Job Matched (distinct users)
    admin.rpc("funnel_job_matched", { from_ts: from, to_ts: to }).single<{ count: number }>(),

    // 5. Cover Letter (distinct users)
    admin.rpc("funnel_cover_letter", { from_ts: from, to_ts: to }).single<{ count: number }>(),

    // 6. PDF Downloaded (distinct users who downloaded in period)
    admin.rpc("funnel_pdf_downloaded", { from_ts: from, to_ts: to }).single<{ count: number }>(),

    // 7. Upgraded to Pro
    admin
      .from("subscription_history")
      .select("id", { count: "exact", head: true })
      .eq("plan", "pro")
      .in("status", ["active", "cancelled", "expired"])
      .gte("started_at", from)
      .lte("started_at", to),

    // 8. Interview Prep (distinct users who created stories)
    admin.rpc("funnel_interview_prep", { from_ts: from, to_ts: to }).single<{ count: number }>(),

    // 9. Jobs Waitlist
    admin
      .from("job_waitlist")
      .select("id", { count: "exact", head: true })
      .gte("created_at", from)
      .lte("created_at", to),
  ]);

  const stages = [
    { key: "signups", label: "Signed Up", count: signups.count ?? 0 },
    { key: "cv_created", label: "CV Created", count: cvCreated.data?.count ?? 0 },
    { key: "ats_scanned", label: "ATS Scanned", count: atsScanned.data?.count ?? 0 },
    { key: "job_matched", label: "Job Matched", count: jobMatched.data?.count ?? 0 },
    { key: "cover_letter", label: "Cover Letter", count: coverLetter.data?.count ?? 0 },
    { key: "pdf_downloaded", label: "PDF Downloaded", count: pdfDownloaded.data?.count ?? 0 },
    { key: "upgraded", label: "Upgraded to Pro", count: upgraded.count ?? 0 },
  ];

  const extras = [
    { key: "interview_prep", label: "Interview Prep", count: interviewPrep.data?.count ?? 0 },
    { key: "jobs_waitlist", label: "Jobs Waitlist", count: jobsWaitlist.count ?? 0 },
  ];

  return NextResponse.json({ stages, extras });
}
