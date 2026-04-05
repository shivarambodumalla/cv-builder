import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const coverLetterId = searchParams.get("cover_letter_id");
  const format = searchParams.get("format") || "txt";

  if (!coverLetterId) {
    return NextResponse.json({ error: "cover_letter_id is required" }, { status: 400 });
  }

  // Fetch cover letter ensuring user ownership through cv
  const { data: letter } = await supabase
    .from("cover_letters")
    .select("id, content, cv_id")
    .eq("id", coverLetterId)
    .single();

  if (!letter) {
    return NextResponse.json({ error: "Cover letter not found" }, { status: 404 });
  }

  // Verify ownership
  const { data: cv } = await supabase
    .from("cvs")
    .select("id, job_company, job_title_target")
    .eq("id", letter.cv_id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single();

  const candidateName = profile?.full_name || "";
  const isFree = (profile?.plan || "free") === "free";

  if (format === "txt") {
    const text = letter.content;
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="cover-letter.txt"',
      },
    });
  }

  if (format === "pdf") {
    // Use worker process for PDF generation (same pattern as CV export)
    const { execFileSync } = await import("child_process");
    const path = await import("path");
    const workerPath = path.join(process.cwd(), "lib/pdf/cover-letter-worker.js");

    try {
      const input = JSON.stringify({
        content: letter.content,
        candidateName,
        company: cv.job_company || "",
        showWatermark: isFree,
      });

      const result = execFileSync("node", [workerPath], {
        input,
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000,
      });

      return new NextResponse(result, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="cover-letter.pdf"',
        },
      });
    } catch (err) {
      console.error("[cover-letter/export] PDF generation failed:", err);
      return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "format must be pdf or txt" }, { status: 400 });
}
