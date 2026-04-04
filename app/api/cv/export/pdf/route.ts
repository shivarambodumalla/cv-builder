import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderCvPdf } from "@/lib/pdf/render";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";
import { DEFAULT_DESIGN } from "@/lib/resume/defaults";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, design: clientDesign, title } = body as {
    content: ResumeContent;
    design: Partial<ResumeDesignSettings>;
    title: string;
  };

  if (!content || !content.contact) {
    return NextResponse.json(
      { error: "CV has no structured data. Edit your CV first." },
      { status: 422 }
    );
  }

  const design: ResumeDesignSettings = { ...DEFAULT_DESIGN, ...clientDesign };

  try {
    const buffer = renderCvPdf(content, design, false);
    const filename = `${(title || "cv").replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[pdf export]", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
