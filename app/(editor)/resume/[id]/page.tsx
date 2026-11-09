import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ResumeEditor } from "@/components/shared/resume-editor";
import { structureCvText } from "@/lib/ai/gemini";
import { sanitizeDbJson } from "@/lib/resume/sanitize";
import { getPlan } from "@/lib/billing/limits";
import { redactAtsReport } from "@/lib/ats/redact";
import type { ResumeContent } from "@/lib/resume/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review_id?: string; from?: string }>;
}

export default async function ResumePage({ params: paramsPromise, searchParams: searchParamsPromise }: Props) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnUrl=%2Fdashboard");
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, title, raw_text, parsed_json, design_settings, updated_at, target_role, job_description, job_company, job_title_target")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    notFound();
  }

  // If Gemini failed during upload, parsed_json will be null but raw_text exists.
  // Retry parsing transparently so the editor loads with content.
  if (!cv.parsed_json && cv.raw_text) {
    try {
      const parsed = await structureCvText(cv.raw_text, { userId: user.id });
      const admin = createAdminClient();
      const clean = sanitizeDbJson(parsed);
      await admin.from("cvs").update({ parsed_json: clean }).eq("id", cv.id);
      cv.parsed_json = clean;
    } catch {
      // Still down — editor loads empty, user can try again later
    }
  }

  const templatePicked =
    (cv.design_settings as { templatePicked?: boolean } | null)?.templatePicked === true;
  if (!templatePicked) {
    redirect(`/resume/${params.id}/pick-template`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_job_match, credits_cover_letter, full_name, avatar_url, plan, subscription_status, current_period_end, pdf_downloads_this_window")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile);

  // report_data is not readable by the browser role (free users only get the
  // redacted view), so read it server-side. Ownership is the CV lookup above.
  const { data: rawReports } = await createAdminClient()
    .from("ats_reports")
    .select("id, score, overall_score, confidence, report_data, issues, created_at")
    .eq("cv_id", cv.id)
    .order("created_at", { ascending: false })
    .limit(1);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const reports = rawReports?.map((r) => {
    const reportData = (r.report_data ?? r.issues) as Record<string, unknown> | null;
    const data = reportData ?? {};

    const score =
      r.overall_score ??
      (data as any).overall_score ??
      r.score ??
      (data as any).score ?? 0;

    const confidence =
      r.confidence ??
      (data as any).confidence ??
      "medium";

    return {
      id: r.id,
      score,
      created_at: r.created_at,
      confidence,
      category_scores: (data as any).category_scores ?? (data as any).categories ?? {},
      keywords: (() => {
        const kw = (data as any).keywords ?? {};
        const flatten = (arr: any[]) =>
          (arr ?? []).map((item: any) =>
            typeof item === "string" ? item : item?.keyword ?? item?.name ?? JSON.stringify(item)
          );
        return {
          found: flatten(kw.found),
          missing: flatten(kw.missing),
          stuffed: flatten(kw.stuffed),
        };
      })(),
      enhancements: (data as any).enhancements ?? [],
      summary: (data as any).summary ?? "",
      is_fallback: (data as any).is_fallback,
      fallback_type: (data as any).fallback_type,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Free plan: only the score, category numbers and a two-issue teaser reach the browser.
  const fullReport = reports?.[0] ?? null;
  const latestReport = fullReport && plan !== "pro" ? redactAtsReport(fullReport) : fullReport;

  const { data: jobMatches } = await supabase
    .from("job_matches")
    .select("id, job_title, job_description, match_score, report_data, created_at")
    .eq("cv_id", cv.id)
    .order("created_at", { ascending: false });

  const { data: coverLetters } = await supabase
    .from("cover_letters")
    .select("id, content, tone, version, job_match_id, created_at")
    .eq("cv_id", cv.id)
    .order("version", { ascending: false });

  // Keyword list for real-time client-side scoring. Pro only: the browser would
  // rebuild the full missing-keyword list from it, which the free plan hides.
  const targetRole = cv.target_role || (cv.parsed_json as ResumeContent)?.targetTitle?.title || "";
  let keywordList = null;
  if (plan === "pro" && targetRole) {
    const { data: kwl } = await supabase
      .from("keyword_lists")
      .select("required, important, nice_to_have, synonym_map")
      .ilike("role", targetRole)
      .limit(1)
      .single();
    keywordList = kwl;
  }

  // Auto-land on ATS tab when CV is freshly uploaded (has content, no scan yet)
  const isFirstScan = !!cv.raw_text && (!rawReports || rawReports.length === 0);
  // Arriving from the career path tool (target role just set): open on the ATS
  // tab so the first screen is the resume against that role.
  const fromCareerPath = searchParams.from === "career-path";
  const initialTab = isFirstScan || fromCareerPath ? "analyser" : "editor";

  // Fetch CV review data if review_id is present in query params
  let reviewData: { id: string; target_role: string | null; status: string; messages: unknown[] } | null = null;
  const reviewId = searchParams.review_id;
  if (reviewId) {
    const admin = createAdminClient();
    const { data: review } = await admin
      .from("cv_reviews")
      .select("id, target_role, status")
      .eq("id", reviewId)
      .eq("user_id", user.id)
      .single();
    if (review) {
      const { data: messages } = await admin
        .from("cv_review_messages")
        .select("id, sender_type, message_type, content, created_at")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });
      reviewData = { ...review, messages: messages ?? [] };
    }
  }

  // Latest post-download rating: a good one (4+) means the prompt stays quiet.
  const { data: lastFeedback } = await supabase
    .from("feedback")
    .select("rating")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <ResumeEditor
      cv={cv}
      lastFeedbackRating={lastFeedback?.rating ?? null}
      latestReport={latestReport}
      jobMatches={jobMatches ?? []}
      coverLetters={coverLetters ?? []}
      keywordList={keywordList}
      credits={{
        jobMatch: profile?.credits_job_match ?? 0,
        coverLetter: profile?.credits_cover_letter ?? 0,
      }}
      user={{
        email: user.email || "",
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
      }}
      plan={plan}
      reviewData={reviewData}
      initialTab={initialTab}
      autoScan={isFirstScan}
    />
  );
}
