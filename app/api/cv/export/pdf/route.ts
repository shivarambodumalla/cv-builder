import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CvPdfTemplate } from "@/components/shared/cv-pdf-template";
import type { ResumeContent } from "@/lib/resume/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cvId = request.nextUrl.searchParams.get("cv_id");

  if (!cvId) {
    return NextResponse.json({ error: "cv_id is required" }, { status: 400 });
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, title, parsed_json")
    .eq("id", cvId)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const parsed = cv.parsed_json as ResumeContent | null;

  if (!parsed || !parsed.contact) {
    return NextResponse.json(
      { error: "CV has no structured data. Edit your CV first." },
      { status: 422 }
    );
  }

  const buffer = await renderToBuffer(
    CvPdfTemplate({ data: parsed, watermark: false })
  );

  const filename = `${(cv.title || "cv").replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
