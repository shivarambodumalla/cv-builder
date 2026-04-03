import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyseCv } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cv_id } = await request.json();

  if (!cv_id) {
    return NextResponse.json({ error: "cv_id is required" }, { status: 400 });
  }

  const { data: cv, error: cvError } = await supabase
    .from("cvs")
    .select("id, raw_text")
    .eq("id", cv_id)
    .eq("user_id", user.id)
    .single();

  if (cvError || !cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  if (!cv.raw_text?.trim()) {
    return NextResponse.json(
      { error: "CV has no text content to analyse" },
      { status: 422 }
    );
  }

  try {
    const report = await analyseCv(cv.raw_text);

    const { data: saved, error: saveError } = await supabase
      .from("ats_reports")
      .insert({
        cv_id: cv.id,
        score: report.score,
        issues: report.issues,
        suggestions: report.suggestions,
      })
      .select("id, score, issues, suggestions, created_at")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      ...saved,
      keywords: report.keywords,
      summary: report.summary,
    });
  } catch {
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 502 }
    );
  }
}
