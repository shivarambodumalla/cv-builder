import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { resolveRole, getDomainForRole } from "@/lib/resume/roles";
import type { ResumeContent } from "@/lib/resume/types";

const MONTHLY_LIMITS: Record<string, number> = {
  free: 3,
  starter: 10,
  pro: Infinity,
};

function buildTrimmedPayload(content: ResumeContent): string {
  const stripped: Record<string, unknown> = {};
  if (content.experience?.items?.length) stripped.experience = content.experience;
  if (content.skills?.categories?.length) stripped.skills = content.skills;
  if (content.summary?.content) stripped.summary = content.summary;
  if (content.projects?.items?.length) stripped.projects = content.projects;

  // Build _meta
  let earliestYear: number | null = null;
  for (const item of content.experience?.items ?? []) {
    const match = (item.startDate ?? "").match(/(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (earliestYear === null || year < earliestYear) earliestYear = year;
    }
  }
  stripped._meta = {
    years_experience: earliestYear ? Math.max(0, new Date().getFullYear() - earliestYear) : 0,
  };

  return JSON.stringify(stripped);
}

async function fetchKeywordList(admin: ReturnType<typeof createAdminClient>, targetRole: string) {
  const { data: exact } = await admin
    .from("keyword_lists")
    .select("required, important, nice_to_have, synonym_map")
    .ilike("role", targetRole)
    .limit(1)
    .single();
  if (exact) return exact;

  const resolved = resolveRole(targetRole);
  if (resolved && resolved.toLowerCase() !== targetRole.toLowerCase()) {
    const { data: mapped } = await admin
      .from("keyword_lists")
      .select("required, important, nice_to_have, synonym_map")
      .ilike("role", resolved)
      .limit(1)
      .single();
    if (mapped) return mapped;
  }

  const domain = getDomainForRole(targetRole);
  if (domain) {
    const { data: domainFallback } = await admin
      .from("keyword_lists")
      .select("required, important, nice_to_have, synonym_map")
      .eq("role", `domain:${domain}`)
      .single();
    if (domainFallback) return domainFallback;
  }

  return { required: [], important: [], nice_to_have: [], synonym_map: {} };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const { cv_id, job_description, job_title, company } = await request.json();

  if (!cv_id) {
    return NextResponse.json({ error: "cv_id is required" }, { status: 400 });
  }

  // Check credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_job_match, plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan as string) || "free";
  const limit = MONTHLY_LIMITS[plan] ?? 3;

  if (plan !== "pro" && (profile?.credits_job_match ?? 0) <= 0) {
    return NextResponse.json(
      { error: "No job match credits remaining. Upgrade your plan for more.", code: "no_credits" },
      { status: 403 }
    );
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, parsed_json, target_role, job_description, job_company, job_title_target")
    .eq("id", cv_id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  // Save JD to cvs table if provided
  const jd = job_description || cv.job_description;
  const comp = company || cv.job_company || "";
  const jTitle = job_title || cv.job_title_target || "";

  if (job_description || company || job_title) {
    await supabase.from("cvs").update({
      job_description: job_description || cv.job_description,
      job_company: company || cv.job_company,
      job_title_target: job_title || cv.job_title_target,
    }).eq("id", cv_id);
  }

  if (!jd) {
    return NextResponse.json(
      { error: "Job description is required. Provide it in the request or save it to the CV first." },
      { status: 400 }
    );
  }

  const content = cv.parsed_json as ResumeContent;
  if (!content?.contact) {
    return NextResponse.json({ error: "CV has no structured data" }, { status: 400 });
  }

  const targetRole = cv.target_role || content.targetTitle?.title || "General";
  const trimmedPayload = buildTrimmedPayload(content);
  const keywordList = await fetchKeywordList(admin, targetRole);

  try {
    const result = await callAI({
      promptName: "job_match_v1",
      variables: {
        targetRole,
        company: comp,
        jobDescription: jd,
        parsedJson: trimmedPayload,
        keywordList: JSON.stringify({
          required: keywordList.required,
          important: keywordList.important,
          nice_to_have: keywordList.nice_to_have,
        }),
        synonymMap: JSON.stringify(keywordList.synonym_map ?? {}),
      },
      feature: "job_match",
      userId: user.id,
      ip,
    });

    const report = result as Record<string, unknown>;

    // Save to job_matches
    const { data: saved, error: saveError } = await supabase
      .from("job_matches")
      .insert({
        cv_id: cv.id,
        job_title: jTitle || null,
        job_description: jd,
        match_score: (report.match_score as number) ?? 0,
        missing_keywords: (report.categories as Record<string, unknown>)?.keyword_match
          ? ((report.categories as Record<string, Record<string, unknown>>).keyword_match.keywords_missing as string[])
          : [],
        report_data: report,
      })
      .select("id, match_score, created_at")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    // Deduct credit
    if (plan !== "pro") {
      await admin.rpc("decrement_credit", {
        user_id: user.id,
        credit_column: "credits_job_match",
      });
    }

    return NextResponse.json({
      ...report,
      id: saved.id,
      created_at: saved.created_at,
      credits_remaining: plan === "pro" ? limit : Math.max(0, (profile?.credits_job_match ?? 1) - 1),
    });
  } catch (err) {
    console.error("[job-match] AI matching failed:", err);
    return NextResponse.json(
      { error: "AI matching failed. Please try again." },
      { status: 502 }
    );
  }
}
