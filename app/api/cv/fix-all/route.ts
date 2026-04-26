import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { getPlan } from "@/lib/billing/limits";
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

  // Check usage limit — columns may not exist yet, so use * select
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
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "fix_all",
      reason: "fix_all_limit",
      used: effectiveCount,
      limit: 1,
    });
    return NextResponse.json({
      error: "Free tier limit reached. Upgrade for unlimited Fix All.",
      code: "fix_all_limit",
    }, { status: 403 });
  }
  if (!cv_id) return NextResponse.json({ error: "cv_id required" }, { status: 400 });

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, parsed_json, target_role")
    .eq("id", cv_id)
    .eq("user_id", user.id)
    .single();

  if (!cv) return NextResponse.json({ error: "CV not found" }, { status: 404 });

  const content = cv.parsed_json as ResumeContent;
  if (!content?.contact) return NextResponse.json({ error: "CV has no data" }, { status: 400 });

  // Get latest ATS report for issues + missing keywords
  const { data: atsReport } = await admin
    .from("ats_reports")
    .select("score, report_data")
    .eq("cv_id", cv_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const reportData = atsReport?.report_data as Record<string, unknown> | null;
  const categories = (reportData?.category_scores ?? {}) as Record<string, { issues?: { description: string; fix: string }[] }>;
  const atsIssues: string[] = [];
  for (const [, cat] of Object.entries(categories)) {
    for (const issue of cat.issues ?? []) {
      atsIssues.push(`${issue.description}. Fix: ${issue.fix}`);
    }
  }

  const keywords = reportData?.keywords as { missing?: string[] } | undefined;
  const missingKeywords = keywords?.missing ?? [];

  const targetRole = cv.target_role || content.targetTitle?.title || "Not specified — optimise for general ATS compatibility";

  try {
    const cvPayload = {
      summary: content.summary,
      experience: content.experience,
      skills: content.skills,
      education: content.education,
    };

    console.log("[fix-all] Starting for", targetRole, "missing:", missingKeywords.length, "issues:", atsIssues.length);

    const result = await callAI({
      promptName: "fix_all_ats_v1",
      variables: {
        target_role: targetRole,
        missing_keywords: missingKeywords.length > 0 ? missingKeywords.join(", ") : "None identified",
        ats_issues: atsIssues.length > 0 ? atsIssues.slice(0, 20).join("\n") : "No specific issues found",
        cv_content: JSON.stringify(cvPayload),
      },
      feature: "fix_all",
      userId: user.id,
      ip,
    });

    // Increment usage — columns may not exist yet, silently ignore errors
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
    console.error("[fix-all] AI fix failed:", msg, err);
    try { alertAdmin("Fix All", msg, { userId: user.id }); } catch { /* ignore */ }
    return NextResponse.json({ error: `AI fix failed: ${msg}` }, { status: 502 });
  }
}
