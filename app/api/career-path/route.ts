import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { alertAdmin } from "@/lib/email/alert";
import { sanitizeDbJson, sanitizeDbString } from "@/lib/resume/sanitize";
import { generateCareerPath, MAX_RESUME_CHARS } from "@/lib/career-path/generate";
import { countryFromHeaders } from "@/lib/career-path/market";
import { computeInputHash, MIN_PATHS, parsePreferences, toPreview } from "@/lib/career-path/normalise";
import type {
  CareerPathResult,
  CareerPathSource,
  CreateCareerPathResponse,
  PreferenceId,
} from "@/lib/career-path/types";
import type { ResumeContent } from "@/lib/resume/types";

// One AI call (queued behind the 6s Gemini gap, with retries) plus provider lookups.
export const maxDuration = 60;

const ROLE_MIN = 2;
const ROLE_MAX = 80;
const YEARS_MAX = 50;
const CACHE_DAYS = 7;
const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

type ParsedResume = Partial<ResumeContent> | null;

/** Most recent job title, then the resume's target title. */
function roleFromResume(parsed: ParsedResume): string | null {
  const items = parsed?.experience?.items ?? [];
  const current = items.find((i) => i?.isCurrent && i.role?.trim()) ?? items.find((i) => i?.role?.trim());
  const role = current?.role?.trim() || parsed?.targetTitle?.title?.trim() || "";
  return role.length >= ROLE_MIN ? role.slice(0, ROLE_MAX).trim() : null;
}

/** Years since the earliest experience start year, when the dates parse. */
function yearsFromResume(parsed: ParsedResume): number | null {
  const years = (parsed?.experience?.items ?? [])
    .map((i) => i?.startDate?.match(/\b(19|20)\d{2}\b/)?.[0])
    .filter((y): y is string => !!y)
    .map(Number);
  if (years.length === 0) return null;
  const total = new Date().getUTCFullYear() - Math.min(...years);
  return Math.min(YEARS_MAX, Math.max(0, total));
}

/** Resume content without contact details, as plain text for the prompt. */
function resumeTextFromParsed(parsed: ParsedResume): string {
  if (!parsed) return "";
  const lines: string[] = [];
  if (parsed.targetTitle?.title) lines.push(`Title: ${parsed.targetTitle.title}`);
  if (parsed.summary?.content) lines.push(`Summary: ${parsed.summary.content}`);
  for (const job of parsed.experience?.items ?? []) {
    const dates = [job.startDate, job.isCurrent ? "Present" : job.endDate].filter(Boolean).join(" to ");
    lines.push(`Experience: ${[job.role, job.company].filter(Boolean).join(" at ")}${dates ? ` (${dates})` : ""}`);
    for (const bullet of job.bullets ?? []) if (bullet?.trim()) lines.push(`- ${bullet.trim()}`);
  }
  for (const cat of parsed.skills?.categories ?? []) {
    const skills = (cat.skills ?? []).filter(Boolean).join(", ");
    if (skills) lines.push(`Skills${cat.name ? ` (${cat.name})` : ""}: ${skills}`);
  }
  for (const edu of parsed.education?.items ?? []) {
    lines.push(`Education: ${[edu.degree, edu.field, edu.institution].filter(Boolean).join(", ")}`);
  }
  for (const cert of parsed.certifications?.items ?? []) {
    if (cert.name) lines.push(`Certification: ${cert.name}`);
  }
  for (const project of (parsed.projects?.items ?? []) as unknown as Record<string, unknown>[]) {
    const text = [project.name, project.description].filter((v) => typeof v === "string" && v).join(": ");
    if (text) lines.push(`Project: ${text}`);
  }
  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }
  if (!body || typeof body !== "object") return badRequest("Invalid request body.");

  // ── Validate input ──
  const redirectToken = typeof body.redirectToken === "string" ? body.redirectToken.trim() : "";
  if (redirectToken && !TOKEN_RE.test(redirectToken)) {
    return badRequest("We couldn't find your uploaded resume. Please upload it again.");
  }

  const roleInput = typeof body.currentRole === "string" ? body.currentRole.replace(/\s+/g, " ").trim() : "";
  if (body.currentRole != null && typeof body.currentRole !== "string") return badRequest("Enter your current role.");
  if (roleInput && (roleInput.length < ROLE_MIN || roleInput.length > ROLE_MAX)) {
    return badRequest(`Your current role should be ${ROLE_MIN} to ${ROLE_MAX} characters.`);
  }
  if (!roleInput && !redirectToken) return badRequest("Enter your current role.");

  let yearsExperience: number | null = null;
  if (body.yearsExperience != null && body.yearsExperience !== "") {
    const n = typeof body.yearsExperience === "string" ? Number(body.yearsExperience) : body.yearsExperience;
    if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > YEARS_MAX) {
      return badRequest(`Years of experience should be a whole number from 0 to ${YEARS_MAX}.`);
    }
    yearsExperience = n;
  }

  const preferences: PreferenceId[] | null = parsePreferences(body.preferences);
  if (!preferences) return badRequest("Pick up to 3 of the listed preferences.");

  // ── Who is asking ──
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ip = clientIp(request);

  const rl = checkRateLimit(ip, !!user);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "You've made a lot of requests in a short time. Please try again in a little while." },
      { status: 429, headers: rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : undefined }
    );
  }

  const admin = createAdminClient();
  const country = countryFromHeaders(request.headers);
  const source: CareerPathSource = redirectToken ? "resume" : "role";

  // ── Resume mode: read the pending upload ──
  let cvId: string | null = null;
  let resumeText: string | null = null;
  let currentRole = roleInput;
  if (redirectToken) {
    const { data: cv, error } = await admin
      .from("cvs")
      .select("id, parsed_json, raw_text, target_role")
      .eq("redirect_token", redirectToken)
      .is("user_id", null)
      .eq("status", "pending_auth")
      .maybeSingle();
    if (error) {
      console.error("[career-path] Pending CV lookup failed:", error.message);
      alertAdmin("Career Path (resume lookup)", error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    if (!cv) return badRequest("We couldn't find your uploaded resume. Please upload it again.");

    cvId = cv.id;
    const parsed = (cv.parsed_json ?? null) as ParsedResume;
    const fromParsed = resumeTextFromParsed(parsed);
    // Parsed content leaves out contact details; raw text is the fallback when parsing failed.
    resumeText = (fromParsed.length >= 200 ? fromParsed : (cv.raw_text as string | null) || fromParsed)
      .slice(0, MAX_RESUME_CHARS)
      .trim() || null;
    if (!resumeText) {
      return badRequest("We couldn't read your resume. Try another file, or type your current role instead.");
    }

    if (!currentRole) {
      const storedRole = typeof cv.target_role === "string" && cv.target_role !== "General" ? cv.target_role.trim() : "";
      currentRole = roleFromResume(parsed) || (storedRole.length >= ROLE_MIN ? storedRole.slice(0, ROLE_MAX) : "");
    }
    if (!currentRole) {
      return badRequest("We couldn't tell your current role from your resume. Please type it in.");
    }
    if (yearsExperience === null) yearsExperience = yearsFromResume(parsed);
  }

  // ── Role mode: reuse a recent identical result ──
  const inputHash = source === "role" ? computeInputHash(currentRole, yearsExperience, preferences, country) : null;
  let result: CareerPathResult | null = null;
  if (inputHash) {
    const since = new Date(Date.now() - CACHE_DAYS * 86400_000).toISOString();
    const { data: cached, error } = await admin
      .from("career_paths")
      .select("result")
      .eq("input_hash", inputHash)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) console.error("[career-path] Cache lookup failed (generating instead):", error.message);
    const cachedResult = cached?.result as CareerPathResult | undefined;
    if (cachedResult && Array.isArray(cachedResult.paths) && cachedResult.paths.length >= MIN_PATHS) {
      result = cachedResult;
    }
  }

  // ── Generate ──
  if (!result) {
    try {
      result = await generateCareerPath({
        currentRole,
        yearsExperience,
        preferences,
        resumeText,
        country,
        userId: user?.id ?? null,
        ip,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[career-path] Generation failed:", message);
      alertAdmin("Career Path generation", message, { role: currentRole, source, country });
      return NextResponse.json(
        { error: "We couldn't work out your career paths just now. Please try again in a minute." },
        { status: 500 }
      );
    }
  }

  // ── Save (every visitor gets their own row) ──
  const { data: row, error: insertError } = await admin
    .from("career_paths")
    .insert({
      user_id: user?.id ?? null,
      cv_id: cvId,
      source,
      current_role: sanitizeDbString(currentRole),
      years_experience: yearsExperience,
      preferences,
      country,
      input_hash: inputHash,
      result: sanitizeDbJson(result),
    })
    .select("id")
    .single();

  if (insertError || !row) {
    const message = insertError?.message ?? "no row returned";
    console.error("[career-path] Insert failed:", message);
    alertAdmin("Career Path save", message, { role: currentRole, source });
    return NextResponse.json({ error: "We couldn't save your results. Please try again." }, { status: 500 });
  }

  const response: CreateCareerPathResponse = { id: row.id, source, preview: toPreview(result) };
  return NextResponse.json(response);
}
