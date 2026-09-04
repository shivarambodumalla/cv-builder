import { NextResponse } from "next/server";
import { findDocxLeaf } from "@/lib/resume-templates/data";
import { buildHarvardDocx } from "@/lib/resume-templates/docx/harvard";

// Blank template downloads, deliberately unauthenticated. The query data behind
// this ("harvard resume template word", "…free download", "…docx") is people
// looking for a document to fill in, and putting a signup in front of it loses
// the visit rather than converting it. The account gate stays where it already
// is — saving, scoring and exporting a real CV.
export const revalidate = 86400;

const BUILDERS: Record<string, () => Promise<Buffer>> = {
  harvard: buildHarvardDocx,
};

export function generateStaticParams() {
  return Object.keys(BUILDERS).map((template) => ({ template }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ template: string }> }
) {
  const { template } = await params;

  const build = BUILDERS[template];
  const leaf = findDocxLeaf(template);
  // Both must agree: a builder exists AND a leaf page has opted in. Stops a
  // download going live for a template whose page never advertised it.
  if (!build || !leaf) {
    return NextResponse.json({ error: "No downloadable template for this slug." }, { status: 404 });
  }

  try {
    const buffer = await build();
    const filename = `${leaf.displayName.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-cvedge.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error(`[templates/${template}/docx] generation failed`, error);
    return NextResponse.json(
      { error: "Could not generate the file. Please try again." },
      { status: 500 }
    );
  }
}
