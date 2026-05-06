import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderHtmlToPdf } from "@/lib/pdf/html-to-pdf";
import { normalizeDesignSettings } from "@/lib/resume/normalize";
import type { ResumeContent } from "@/lib/resume/types";

/** Coerce raw DB parsed_json into a shape templates can safely render.
 *  Old CVs may have missing sections or undefined arrays that crash templates. */
function sanitizeContent(raw: unknown): ResumeContent {
  const c = (raw ?? {}) as Record<string, unknown>;

  function arr<T>(v: unknown): T[] {
    return Array.isArray(v) ? v : [];
  }

  const skills = (c.skills ?? {}) as Record<string, unknown>;
  const sanitizedCategories = arr<Record<string, unknown>>(skills.categories).map((cat) => ({
    name: String(cat.name ?? ""),
    skills: arr<string>(cat.skills),
  }));

  function sanitizeItems<T>(section: unknown): T[] {
    return arr<Record<string, unknown>>(
      (section as Record<string, unknown>)?.items
    ).map((item) => ({ ...item, bullets: arr<string>(item.bullets) })) as unknown as T[];
  }

  return {
    sections: {
      contact:       true,
      targetTitle:   true,
      summary:       true,
      experience:    true,
      education:     true,
      skills:        true,
      certifications: true,
      awards:        true,
      projects:      true,
      volunteering:  true,
      publications:  true,
      ...(typeof c.sections === "object" && c.sections !== null ? c.sections : {}),
    },
    contact:        (c.contact ?? {}) as ResumeContent["contact"],
    targetTitle:    (c.targetTitle ?? {}) as ResumeContent["targetTitle"],
    summary:        (c.summary ?? {}) as ResumeContent["summary"],
    experience:     { items: sanitizeItems(c.experience) },
    education:      { items: sanitizeItems(c.education) },
    skills:         { categories: sanitizedCategories },
    certifications: { items: sanitizeItems(c.certifications) },
    awards:         { items: sanitizeItems(c.awards) },
    projects:       { items: sanitizeItems(c.projects) },
    volunteering:   { items: sanitizeItems(c.volunteering) },
    publications:   { items: sanitizeItems(c.publications) },
  };
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cvId: string }> },
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const { cvId } = await params;
  const supabase = createAdminClient();

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, title, parsed_json, design_settings")
    .eq("id", cvId)
    .maybeSingle();

  if (!cv) {
    return new NextResponse("CV not found", { status: 404 });
  }

  if (!cv.parsed_json) {
    return new NextResponse("CV has no parsed content", { status: 422 });
  }

  const design = normalizeDesignSettings(cv.design_settings);

  const content = sanitizeContent(cv.parsed_json);

  let pdf: Buffer;
  try {
    pdf = await renderHtmlToPdf(content, design, false);
  } catch (err) {
    console.error("[admin/cv/pdf] renderHtmlToPdf failed:", err);
    return new NextResponse(
      JSON.stringify({ error: "PDF render failed", detail: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const filename = (cv.title || "resume").replace(/[^a-z0-9_\-\s]/gi, "").trim() || "resume";

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
