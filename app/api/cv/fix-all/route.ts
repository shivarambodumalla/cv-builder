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

  // Quota from plan_limits (free 0 = Pro only, pro -1), counter fix_all_this_week (Monday reset).
  const access = await checkFeatureAccess(user.id, "fix_all");
  if (!access.allowed) {
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "fix_all",
      reason: access.reason,
      used: access.used,
      limit: access.limit,
    });
    return NextResponse.json({
      error: access.proOnly
        ? "Fix All is a Pro feature. Upgrade for unlimited one-click fixes."
        : "You've used all your Fix All runs this week. Upgrade for unlimited.",
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

  const targetRole = cv.target_role || content.targetTitle?.title || "Not specified. Optimise for general ATS compatibility";

  try {
    const cvPayload = {
      summary: content.summary,
      experience: content.experience,
      skills: content.skills,
      education: content.education,
    };

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

    // Awaited so Vercel doesn't freeze the function before the writes land.
    await Promise.all([
      incrementUsage(user.id, "fix_all").catch(() => {}),
      // Read by lib/guarantee/check.ts: the 80+ guarantee needs one Fix All run.
      admin.from("profiles").update({ fix_all_used_at: new Date().toISOString() }).eq("id", user.id),
    ]);

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[fix-all] AI fix failed:", msg, err);
    try { alertAdmin("Fix All", msg, { userId: user.id }); } catch { /* ignore */ }
    return NextResponse.json({ error: `AI fix failed: ${msg}` }, { status: 502 });
  }
}
