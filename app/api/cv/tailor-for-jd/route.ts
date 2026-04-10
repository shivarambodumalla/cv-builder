import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { getPlan } from "@/lib/billing/limits";
import type { ResumeContent } from "@/lib/resume/types";
import { alertAdmin } from "@/lib/email/alert";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const { cv_id } = await request.json();

  // Check usage limit — shares fix_all_count_week counter
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileAny = profile as any;
  const countThisWeek = profileAny?.fix_all_count_week ?? 0;
  const windowStart = profileAny?.fix_all_window_start;
  const windowExpired = !windowStart || (Date.now() - new Date(windowStart).getTime()) > 7 * 24 * 60 * 60 * 1000;

  const effectiveCount = windowExpired ? 0 : countThisWeek;

  if (plan === "free" && effectiveCount >= 1) {
    return NextResponse.json({
      error: "Free tier limit reached. Upgrade for unlimited Tailor for JD.",
      code: "fix_all_limit",
    }, { status: 403 });
  }
  if (!cv_id) return NextResponse.json({ error: "cv_id required" }, { status: 400 });

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, parsed_json, target_role, job_description")
    .eq("id", cv_id)
    .eq("user_id", user.id)
    .single();

  if (!cv) return NextResponse.json({ error: "CV not found" }, { status: 404 });

  const content = cv.parsed_json as ResumeContent;
  if (!content?.contact) return NextResponse.json({ error: "CV has no data" }, { status: 400 });

  if (!cv.job_description) {
    return NextResponse.json({ error: "No job description found for this CV. Please add a job description first." }, { status: 400 });
  }

  // Get latest job_matches report for missing_keywords and match_gaps
  const { data: matchReport } = await admin
    .from("job_matches")
    .select("score, report_data")
    .eq("cv_id", cv_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const reportData = matchReport?.report_data as Record<string, unknown> | null;

  // Extract missing keywords from job match report
  const categories = (reportData?.categories ?? {}) as Record<string, {
    issues?: { description: string; fix: string }[];
    keywords_missing?: string[];
    hard_skills_missing?: string[];
    soft_skills_missing?: string[];
  }>;

  const missingKeywords: string[] = [];
  const matchGaps: string[] = [];

  for (const [catName, cat] of Object.entries(categories)) {
    if (cat.keywords_missing) missingKeywords.push(...cat.keywords_missing);
    if (cat.hard_skills_missing) missingKeywords.push(...cat.hard_skills_missing);
    if (cat.soft_skills_missing) missingKeywords.push(...cat.soft_skills_missing);
    for (const issue of cat.issues ?? []) {
      matchGaps.push(`[${catName}] ${issue.description}. Fix: ${issue.fix}`);
    }
  }

  const currentMatchScore = matchReport?.score ?? 0;
  const targetRole = cv.target_role || content.targetTitle?.title || "Not specified";

  try {
    const cvPayload = {
      summary: content.summary,
      experience: content.experience,
      skills: content.skills,
      education: content.education,
    };

    console.log("[tailor-for-jd] Starting for", targetRole, "missing keywords:", missingKeywords.length, "gaps:", matchGaps.length);

    const result = await callAI({
      promptName: "cv_tailor_per_jd_v1",
      variables: {
        target_role: targetRole,
        jd_text: cv.job_description,
        missing_keywords: missingKeywords.length > 0 ? missingKeywords.join(", ") : "None identified",
        match_gaps: matchGaps.length > 0 ? matchGaps.slice(0, 20).join("\n") : "No specific gaps found",
        current_match_score: String(currentMatchScore),
        cv_content: JSON.stringify(cvPayload),
      },
      feature: "cv_tailor",
      userId: user.id,
      ip,
    });

    // Increment usage — shares fix_all_count_week counter
    try {
      const updates: Record<string, unknown> = {
        fix_all_used_at: new Date().toISOString(),
        fix_all_count_week: windowExpired ? 1 : effectiveCount + 1,
      };
      if (windowExpired) updates.fix_all_window_start = new Date().toISOString();
      await admin.from("profiles").update(updates).eq("id", user.id);
    } catch { /* columns may not exist yet */ }

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tailor-for-jd] AI tailor failed:", msg, err);
    try { alertAdmin("Tailor for JD", msg, { userId: user.id }); } catch { /* ignore */ }
    return NextResponse.json({ error: `AI tailor failed: ${msg}` }, { status: 502 });
  }
}
