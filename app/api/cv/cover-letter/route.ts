import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";
import type { ResumeContent } from "@/lib/resume/types";


function extractKeyRequirements(jd: string): string {
  const lines = jd.split(/\n/).filter((l) => l.trim());
  const requirementLines = lines.filter(
    (l) =>
      /^\s*[-•*]\s/.test(l) ||
      /\d+\+?\s*years/i.test(l) ||
      /experience (with|in)/i.test(l) ||
      /proficien/i.test(l) ||
      /required|must have|essential/i.test(l)
  );
  return requirementLines.slice(0, 5).join("\n") || lines.slice(0, 5).join("\n");
}

function extractTopAchievements(content: ResumeContent): string {
  const bullets: string[] = [];
  for (const item of content.experience?.items ?? []) {
    for (const bullet of item.bullets?.filter(Boolean) ?? []) {
      if (/\d+%|\$[\d,]+|increased|reduced|improved|delivered|launched|grew|saved/i.test(bullet)) {
        bullets.push(bullet);
      }
    }
  }
  return bullets.slice(0, 3).join("\n") || "No specific metrics available";
}

function getYearsExperience(content: ResumeContent): string {
  let earliestYear: number | null = null;
  for (const item of content.experience?.items ?? []) {
    const match = (item.startDate ?? "").match(/(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (earliestYear === null || year < earliestYear) earliestYear = year;
    }
  }
  return earliestYear ? String(Math.max(0, new Date().getFullYear() - earliestYear)) : "several";
}

import { alertAdmin } from "@/lib/email/alert";
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const { cv_id, job_match_id, tone, regenerate } = await request.json();

  if (!cv_id) {
    return NextResponse.json({ error: "cv_id is required" }, { status: 400 });
  }

  const validTone = tone || "professional";
  if (!["professional", "conversational", "confident"].includes(validTone)) {
    return NextResponse.json({ error: "tone must be professional, conversational, or confident" }, { status: 400 });
  }

  // Check feature limit
  const access = await checkFeatureAccess(user.id, "cover_letter");
  if (!access.allowed) {
    return NextResponse.json({ error: "You've used all free cover letters. Upgrade for unlimited.", code: access.reason, used: access.used, limit: access.limit, daysUntilReset: access.daysUntilReset }, { status: 403 });
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

  const content = cv.parsed_json as ResumeContent;
  if (!content?.contact) {
    return NextResponse.json({ error: "CV has no structured data" }, { status: 400 });
  }

  // Fetch job match if provided
  let jobMatch: Record<string, unknown> | null = null;
  if (job_match_id) {
    const { data: jm } = await supabase
      .from("job_matches")
      .select("id, job_title, job_description, report_data")
      .eq("id", job_match_id)
      .eq("cv_id", cv_id)
      .single();
    jobMatch = jm;
  }

  // Check for existing cover letter (return existing unless regenerate)
  if (!regenerate) {
    const query = supabase
      .from("cover_letters")
      .select("id, content, tone, version, created_at")
      .eq("cv_id", cv_id)
      .eq("tone", validTone)
      .order("version", { ascending: false })
      .limit(1);

    if (job_match_id) {
      query.eq("job_match_id", job_match_id);
    }

    const { data: existing } = await query.single();
    if (existing) {
      return NextResponse.json(existing);
    }
  }

  const jd = (jobMatch?.job_description as string) || cv.job_description || "";
  if (!jd) {
    return NextResponse.json(
      { error: "No job description found. Add a job description in the Job Match tab first." },
      { status: 400 }
    );
  }

  // Build variables
  const candidateName = content.contact?.name || "the candidate";
  const yearsExperience = getYearsExperience(content);
  const candidateSummary = content.summary?.content || "";
  const topAchievements = extractTopAchievements(content);
  const keyRequirements = extractKeyRequirements(jd);
  const jobDescriptionSummary = jd.slice(0, 300);

  // Skills match from job match report or CV skills
  let skillsMatch = "";
  if (jobMatch?.report_data) {
    const report = jobMatch.report_data as Record<string, unknown>;
    const categories = report.categories as Record<string, Record<string, unknown>> | undefined;
    if (categories?.skills_match) {
      const sm = categories.skills_match;
      skillsMatch = `Matched: ${(sm.hard_skills_matched as string[] ?? []).join(", ")}. Missing: ${(sm.hard_skills_missing as string[] ?? []).join(", ")}`;
    }
  }
  if (!skillsMatch) {
    const skills = (content.skills?.categories ?? []).flatMap((c) => c.skills).slice(0, 10);
    skillsMatch = skills.join(", ");
  }

  const targetRole = cv.target_role || cv.job_title_target || content.targetTitle?.title || "the role";
  const company = cv.job_company || "the company";

  try {
    const result = await callAI({
      promptName: "cover_letter_v1",
      variables: {
        tone: validTone,
        targetRole,
        company,
        candidateName,
        yearsExperience,
        jobDescriptionSummary,
        keyRequirements,
        candidateSummary,
        topAchievements,
        skillsMatch,
      },
      feature: "cover_letter",
      parseJson: false,
      userId: user.id,
      ip,
    });

    const letterContent = result as string;

    // Get current max version
    const { data: maxVersionRow } = await supabase
      .from("cover_letters")
      .select("version")
      .eq("cv_id", cv_id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const newVersion = (maxVersionRow?.version ?? 0) + 1;

    const { data: saved, error: saveError } = await supabase
      .from("cover_letters")
      .insert({
        cv_id: cv.id,
        job_match_id: job_match_id || null,
        content: letterContent,
        tone: validTone,
        version: newVersion,
      })
      .select("id, content, tone, version, created_at")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }


    // Increment usage
    incrementUsage(user.id, "cover_letter").catch(() => {});

    return NextResponse.json(saved);
  } catch (err) {
    console.error("[cover-letter] AI generation failed:", err);
    alertAdmin("Cover Letter", (err as Error).message, { userId: user.id });
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 502 }
    );
  }
}
