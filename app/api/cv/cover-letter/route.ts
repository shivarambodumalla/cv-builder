import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCoverLetter, type CoverLetterTone } from "@/lib/ai/gemini";

const validTones: CoverLetterTone[] = ["professional", "conversational", "confident"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cv_id, job_match_id, tone } = await request.json();

  if (!cv_id || !job_match_id) {
    return NextResponse.json(
      { error: "cv_id and job_match_id are required" },
      { status: 400 }
    );
  }

  if (!validTones.includes(tone)) {
    return NextResponse.json(
      { error: "tone must be professional, conversational, or confident" },
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

  const { data: jobMatch } = await supabase
    .from("job_matches")
    .select("id, job_title, job_description")
    .eq("id", job_match_id)
    .eq("cv_id", cv_id)
    .single();

  if (!jobMatch) {
    return NextResponse.json({ error: "Job match not found" }, { status: 404 });
  }

  try {
    const content = await generateCoverLetter(
      cv.raw_text,
      jobMatch.job_title || "the role",
      jobMatch.job_description,
      tone as CoverLetterTone
    );

    const { data: saved, error: saveError } = await supabase
      .from("cover_letters")
      .insert({
        cv_id: cv.id,
        job_match_id: jobMatch.id,
        content,
      })
      .select("id, content, created_at")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 502 }
    );
  }
}
