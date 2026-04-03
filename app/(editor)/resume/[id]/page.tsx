import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResumeEditor } from "@/components/shared/resume-editor";

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
    .select("id, title, raw_text, parsed_json, design_settings")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    notFound();
  }

  const { data: reports } = await supabase
    .from("ats_reports")
    .select("id, score, issues, suggestions, created_at")
    .eq("cv_id", cv.id)
    .order("created_at", { ascending: false })
    .limit(1);

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
