import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchJob } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cv_id, job_description, job_title } = await request.json();

  if (!cv_id || !job_description) {
    return NextResponse.json(
      { error: "cv_id and job_description are required" },
      { status: 400 }
    );
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, raw_text")
    .eq("id", cv_id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  try {
    const result = await matchJob(cv.raw_text, job_description);

    const { data: saved, error: saveError } = await supabase
      .from("job_matches")
      .insert({
        cv_id: cv.id,
        job_title: job_title || null,
        job_description,
        match_score: result.match_score,
        missing_keywords: result.missing_keywords,
      })
      .select("id, match_score, missing_keywords, created_at")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      ...saved,
      matched_keywords: result.matched_keywords,
      suggestions: result.suggestions,
    });
  } catch {
    return NextResponse.json(
      { error: "AI matching failed. Please try again." },
      { status: 502 }
    );
  }
}
