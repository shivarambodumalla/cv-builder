import { NextResponse } from "next/server";
import { findDocxLeaf } from "@/lib/resume-templates/data";
import { buildEuropassDocx } from "@/lib/resume-templates/docx/europass";
import { buildExecutiveDocx } from "@/lib/resume-templates/docx/executive";
import { buildGccDocx } from "@/lib/resume-templates/docx/gcc";
import { buildHarvardDocx } from "@/lib/resume-templates/docx/harvard";
import { buildIimDocx } from "@/lib/resume-templates/docx/iim";
import { buildJakesDocx } from "@/lib/resume-templates/docx/jakes";
import { buildLebenslaufDocx } from "@/lib/resume-templates/docx/lebenslauf";

// Blank template downloads, deliberately unauthenticated. The query data behind
// this ("harvard resume template word", "…free download", "…docx") is people
// looking for a document to fill in, and putting a signup in front of it loses
// the visit rather than converting it. The account gate stays where it already
// is — saving, scoring and exporting a real CV.
export const revalidate = 86400;

const BUILDERS: Record<string, () => Promise<Buffer>> = {
  harvard: buildHarvardDocx,
  executive: buildExecutiveDocx,
  gcc: buildGccDocx,
  lebenslauf: buildLebenslaufDocx,
  iim: buildIimDocx,
  europass: buildEuropassDocx,
  jakes: buildJakesDocx,
};

// Regional formats are downloads without a matching template leaf — the Gulf
// personal-details block and the German tabellarischer Lebenslauf are
// conventions rather than visual designs, so they live on their market pages
// instead of in the templates tree. Named here so the leaf opt-in below still
// gates everything else.
const STANDALONE_FORMATS = new Set(["gcc", "lebenslauf", "iim", "europass", "jakes"]);

const DOWNLOAD_NAMES: Record<string, string> = {
  gcc: "gcc-cv-template-cvedge.docx",
  lebenslauf: "lebenslauf-vorlage-cvedge.docx",
  iim: "iim-resume-format-cvedge.docx",
  europass: "europass-cv-template-cvedge.docx",
  jakes: "jakes-resume-template-cvedge.docx",
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
  const isStandalone = STANDALONE_FORMATS.has(template);
  // A builder must exist, and — unless it is a standalone regional format — a
  // leaf page must have opted in. Stops a download going live for a template
  // whose page never advertised it.
  if (!build || (!leaf && !isStandalone)) {
    return NextResponse.json({ error: "No downloadable template for this slug." }, { status: 404 });
  }

  try {
    const buffer = await build();
    const filename =
      DOWNLOAD_NAMES[template] ??
      `${leaf!.displayName.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-cvedge.docx`;

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
