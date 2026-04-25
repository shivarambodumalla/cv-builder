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
  provider?: string;
}

// Whitelist of known providers — anything else gets stored as null so we don't
// pollute analytics with junk values from URL tampering.
const KNOWN_PROVIDERS = new Set(["adzuna", "jooble", "careerjet"]);

function normalizeProvider(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  return KNOWN_PROVIDERS.has(lower) ? lower : null;
}

// Open-redirect guard. Only allow http(s) absolute URLs — never internal paths
// or javascript:/data: schemes.
function safeRedirect(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
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

  const { jobId, jobTitle, company, location, salaryMin, salaryMax, matchScore, redirectUrl, provider } =
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
    provider: normalizeProvider(provider),
    source: "web",
  });

  if (error) {
    console.error("[jobs/track-click]", error.message);
    // Fire-and-forget: don't block the user — return ok regardless
  }

  return NextResponse.json({ ok: true });
}

// GET path used by tracked links inside emails. Logs the click (best-effort,
// auth-optional) then 302s the user to the partner job page. Without this
// handler the email links 405 and we lose every email-driven click.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("job_id");
  const redirect = safeRedirect(url.searchParams.get("redirect"));
  const source = url.searchParams.get("src") || "email";
  const provider = normalizeProvider(url.searchParams.get("provider"));

  if (!jobId || !redirect) {
    return NextResponse.json(
      { error: "job_id and a valid redirect URL are required" },
      { status: 400 }
    );
  }

  // Best-effort: get the user but don't block if anonymous.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // ignore — anonymous email click is still loggable
  }

  const admin = createAdminClient();
  admin
    .from("job_clicks")
    .insert({
      user_id: userId,
      job_id: jobId,
      redirect_url: redirect,
      provider,
      source,
    })
    .then(({ error }) => {
      if (error) console.error("[jobs/track-click GET]", error.message);
    }, () => {});

  return NextResponse.redirect(redirect, 302);
}
