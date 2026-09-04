import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";

// A4 at 1" margins leaves 6.27" of line. Dates sit on a right tab at that edge,
// which is what produces the Harvard look — entry on the left, dates flush right —
// without a table. Tables are the usual way to do this and the usual reason a
// resume misparses, so the whole file deliberately contains none.
const CONTENT_WIDTH_TWIPS = 9026;

const HEADING_COLOR = "000000";
const MUTED = "444444";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 260, after: 90 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 2 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22, // half-points → 11pt
        characterSpacing: 30,
        color: HEADING_COLOR,
      }),
    ],
  });
}

/** Entry line: bold title on the left, dates flush right on a tab stop. */
function entryLine(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH_TWIPS }],
    spacing: { before: 140, after: 0 },
    children: [
      new TextRun({ text: left, bold: true, size: 22 }),
      new TextRun({ text: `\t${right}`, size: 22 }),
    ],
  });
}

/** Second line of an entry: role or degree, italic, with optional right-hand location. */
function subLine(left: string, right?: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH_TWIPS }],
    spacing: { before: 0, after: 60 },
    children: [
      new TextRun({ text: left, italics: true, size: 22 }),
      ...(right ? [new TextRun({ text: `\t${right}`, italics: true, size: 22 })] : []),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function hint(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 120 },
    children: [new TextRun({ text, size: 18, italics: true, color: MUTED })],
  });
}

/**
 * A blank Harvard-format resume: real structure, placeholder content, and a
 * short prompt under each section explaining what belongs there.
 *
 * Deliberately empty of anything CVEdge-specific beyond a single closing line.
 * People searching "harvard resume template word" want a document to fill in,
 * and a file that opens as an advert converts worse than one that opens as a
 * usable template.
 */
export async function buildHarvardDocx(): Promise<Buffer> {
  const doc = new Document({
    creator: "CVEdge",
    title: "Harvard Resume Template",
    description:
      "Blank Harvard-format resume template — single column, ATS-safe. Not affiliated with Harvard University.",
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 22 },
          paragraph: { spacing: { line: 264 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // ── Header ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "YOUR NAME", bold: true, size: 32, characterSpacing: 40 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "City, Country · your.email@example.com · +00 0000 000000 · linkedin.com/in/yourname",
                size: 20,
              }),
            ],
          }),

          // ── Education ──
          sectionHeading("Education"),
          hint(
            "Education leads while you are a student or within a year or two of graduating. Once you have more professional experience than academic credentials, move this section below Experience."
          ),
          entryLine("University Name", "City, Country"),
          subLine("Degree, Subject — Grade or honours", "Sept 2020 – June 2024"),
          bullet("Relevant coursework, thesis title, or an academic award worth naming."),
          bullet("A society, committee or leadership role, if it shows something a job cannot."),

          // ── Experience ──
          sectionHeading("Experience"),
          hint(
            "Reverse chronological. Lead each bullet with what changed, not what you were assigned — the format gives you no visual hierarchy to hide behind, so weak lines are conspicuous."
          ),
          entryLine("Company Name", "City, Country"),
          subLine("Your Job Title", "Jan 2024 – Present"),
          bullet(
            "Start with a strong past-tense verb, state the result, and attach a number: “Reduced onboarding time 40% by rewriting the setup flow.”"
          ),
          bullet("Name the scale you worked at — users, revenue, team size, requests, budget."),
          bullet("Keep each bullet to one or two lines. Three is a paragraph pretending to be a bullet."),
          entryLine("Previous Company", "City, Country"),
          subLine("Your Job Title", "Jun 2022 – Dec 2023"),
          bullet("Two or three bullets is enough for older roles. Recency earns space."),

          // ── Skills ──
          sectionHeading("Skills & Certifications"),
          hint(
            "This is where keyword matching does most of its work. Mirror the vocabulary of the postings you are targeting rather than your own internal jargon."
          ),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "Technical: ", bold: true, size: 22 }),
              new TextRun({ text: "List tools, languages and platforms, comma separated.", size: 22 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "Certifications: ", bold: true, size: 22 }),
              new TextRun({ text: "Certification name, issuing body, year.", size: 22 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "Languages: ", bold: true, size: 22 }),
              new TextRun({ text: "Language (level), Language (level).", size: 22 }),
            ],
          }),

          // ── Optional ──
          sectionHeading("Projects, Publications & Awards"),
          hint(
            "Optional. Keep it if it carries weight for the role you are applying to; delete the whole section if it does not."
          ),
          entryLine("Project, paper or award title", "2024"),
          bullet("One line on what it was and why it mattered."),

          // ── Footer ──
          new Paragraph({
            spacing: { before: 420 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB", space: 6 } },
            children: [
              new TextRun({
                text: "Delete every italic prompt before you send this. Named for the format described in Harvard's career-services guidance; not affiliated with or endorsed by Harvard University.",
                size: 16,
                italics: true,
                color: MUTED,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60 },
            children: [
              new TextRun({
                text: "Want it scored before you apply? Upload it at thecvedge.com/upload-resume for a free ATS check.",
                size: 16,
                italics: true,
                color: MUTED,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
