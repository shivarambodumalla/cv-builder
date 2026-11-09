import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";
import { logServerActivity } from "@/lib/analytics/server-log";
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

  // Quota from plan_limits (free 0 = Pro only, pro -1), counter cv_tailor_this_week (Monday reset).
  const access = await checkFeatureAccess(user.id, "cv_tailor");
  if (!access.allowed) {
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "cv_tailor",
      reason: access.reason,
      used: access.used,
      limit: access.limit,
    });
    return NextResponse.json({
      error: access.proOnly
        ? "Tailor CV is a Pro feature. Upgrade for unlimited tailoring."
        : "You've used all your CV tailors this week. Upgrade for unlimited.",
      code: access.reason,
      used: access.used,
      limit: access.limit,
      daysUntilReset: access.daysUntilReset,
      proOnly: access.proOnly,
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

    // Awaited so Vercel doesn't freeze the function before the writes land.
    await Promise.all([
      incrementUsage(user.id, "cv_tailor").catch(() => {}),
      // Tailoring rewrites the CV like Fix All does, so it counts for the 80+ guarantee too.
      admin.from("profiles").update({ fix_all_used_at: new Date().toISOString() }).eq("id", user.id),
    ]);

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tailor-for-jd] AI tailor failed:", msg, err);
    try { alertAdmin("Tailor for JD", msg, { userId: user.id }); } catch { /* ignore */ }
    return NextResponse.json({ error: `AI tailor failed: ${msg}` }, { status: 502 });
  }
}
