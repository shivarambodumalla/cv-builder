import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── GET: fetch all saved jobs for the authenticated user ──────────────────────

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("[jobs/save GET]", error.message);
    return NextResponse.json({ error: "Failed to fetch saved jobs" }, { status: 500 });
  }

  return NextResponse.json({ savedJobs: data ?? [] });
}

// ─── POST: save a job (upsert) ────────────────────────────────────────────────

interface SaveJobBody {
  jobId: string;
  jobTitle: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  matchScore?: number;
  redirectUrl?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SaveJobBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { jobId, jobTitle, company, location, salaryMin, salaryMax, matchScore, redirectUrl } = body;

  if (!jobId || !jobTitle) {
    return NextResponse.json({ error: "jobId and jobTitle are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin.from("saved_jobs").upsert(
    {
      user_id: user.id,
      job_id: jobId,
      job_title: jobTitle,
      company: company ?? null,
      location: location ?? null,
      salary_min: salaryMin ?? null,
      salary_max: salaryMax ?? null,
      match_score: matchScore ?? null,
      redirect_url: redirectUrl ?? null,
      status: "active",
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,job_id" }
  );

  if (error) {
    console.error("[jobs/save POST]", error.message);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE: unsave a job by job_id ───────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const jobId = searchParams.get("job_id");

  if (!jobId) {
    return NextResponse.json({ error: "job_id query param is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) {
    console.error("[jobs/save DELETE]", error.message);
    return NextResponse.json({ error: "Failed to unsave job" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
