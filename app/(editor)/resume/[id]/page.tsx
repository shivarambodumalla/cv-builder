import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResumeEditor } from "@/components/shared/resume-editor";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResumePage({ params: paramsPromise }: Props) {
  const params = await paramsPromise;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, title, raw_text, parsed_json, design_settings, updated_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    notFound();
  }

  const { data: rawReports } = await supabase
    .from("ats_reports")
    .select("id, score, overall_score, confidence, report_data, issues, created_at")
    .eq("cv_id", cv.id)
    .order("created_at", { ascending: false })
    .limit(1);

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

    console.log("[resume-page] full report row:", JSON.stringify(r, null, 2));
    console.log("[resume-page] resolved score:", score, "confidence:", confidence);

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_job_match, credits_cover_letter, full_name, avatar_url, plan")
    .eq("id", user.id)
    .single();

  const { data: jobMatches } = await supabase
    .from("job_matches")
    .select("id, job_title, match_score, created_at")
    .eq("cv_id", cv.id)
    .order("created_at", { ascending: false });

  return (
    <ResumeEditor
      cv={cv}
      latestReport={reports?.[0] ?? null}
      jobMatches={jobMatches ?? []}
      credits={{
        jobMatch: profile?.credits_job_match ?? 0,
        coverLetter: profile?.credits_cover_letter ?? 0,
      }}
      user={{
        email: user.email || "",
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
      }}
      plan={(profile?.plan as "free" | "starter" | "pro") || "free"}
    />
  );
}
