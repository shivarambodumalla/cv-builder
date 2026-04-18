import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface TrackClickBody {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  matchScore?: number;
  redirectUrl: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TrackClickBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { jobId, jobTitle, company, location, salaryMin, salaryMax, matchScore, redirectUrl } =
    body;

  if (!jobId || !jobTitle || !redirectUrl) {
    return NextResponse.json(
      { error: "jobId, jobTitle, and redirectUrl are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { error } = await admin.from("job_clicks").insert({
    user_id: user.id,
    job_id: jobId,
    job_title: jobTitle,
    company,
    location,
    salary_min: salaryMin ?? null,
    salary_max: salaryMax ?? null,
    match_score: matchScore ?? null,
    redirect_url: redirectUrl,
  });

  if (error) {
    console.error("[jobs/track-click]", error.message);
    // Fire-and-forget: don't block the user — return ok regardless
  }

  return NextResponse.json({ ok: true });
}
