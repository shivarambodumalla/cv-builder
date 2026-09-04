import {
  AlignmentType,
  BorderStyle,
  Document,
  IParagraphOptions,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";

// A4 at 1" margins leaves this much line. Dates sit on a right tab at that edge,
// which is what produces the "entry left, dates flush right" look without a
// table. Tables are the usual way to do this and the usual reason a resume
// misparses, so every builder here deliberately contains none.
export const CONTENT_WIDTH_TWIPS = 9026;
export const MUTED = "444444";

export interface FormatSpec {
  /** Body typeface. Serif reads as traditional, sans as contemporary. */
  font: string;
  /** Body size in half-points — 22 is 11pt. */
  bodySize: number;
  /** Name size in half-points. */
  nameSize: number;
  /** Line spacing in twentieths of a point. 264 is tight, 300 is generous. */
  line: number;
  /** Whether the header block is centred (academic) or left-aligned (corporate). */
  centreHeader: boolean;
  /** Space above each section heading, in twentieths of a point. */
  headingBefore: number;
  /** Rule under section headings. Harvard uses a hairline; Executive a heavier one. */
  headingRuleSize: number;
}

export function makeBuilders(spec: FormatSpec) {
  const { bodySize } = spec;

  const sectionHeading = (text: string): Paragraph =>
    new Paragraph({
      spacing: { before: spec.headingBefore, after: 90 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: spec.headingRuleSize,
          color: "000000",
          space: 2,
        },
      },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: bodySize,
          characterSpacing: 30,
        }),
      ],
    });

  /** Entry line: bold title on the left, dates flush right on a tab stop. */
  const entryLine = (left: string, right: string): Paragraph =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH_TWIPS }],
      spacing: { before: 140, after: 0 },
      children: [
        new TextRun({ text: left, bold: true, size: bodySize }),
        new TextRun({ text: `\t${right}`, size: bodySize }),
      ],
    });

  /** Second line of an entry: role or degree, italic, optional right-hand value. */
  const subLine = (left: string, right?: string): Paragraph =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH_TWIPS }],
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({ text: left, italics: true, size: bodySize }),
        ...(right ? [new TextRun({ text: `\t${right}`, italics: true, size: bodySize })] : []),
      ],
    });

  const bullet = (text: string): Paragraph =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text, size: bodySize })],
    });

  /** Italic prompt telling the reader what belongs in the section above. */
  const hint = (text: string): Paragraph =>
    new Paragraph({
      spacing: { before: 40, after: 120 },
      children: [new TextRun({ text, size: 18, italics: true, color: MUTED })],
    });

  const body = (text: string, opts: IParagraphOptions = {}): Paragraph =>
    new Paragraph({
      spacing: { after: 60 },
      ...opts,
      children: [new TextRun({ text, size: bodySize })],
    });

  /** "Label: value" line, used for skills groupings. */
  const labelled = (label: string, value: string): Paragraph =>
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: bodySize }),
        new TextRun({ text: value, size: bodySize }),
      ],
    });

  const header = (name: string, contact: string): Paragraph[] => [
    new Paragraph({
      alignment: spec.centreHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: name, bold: true, size: spec.nameSize, characterSpacing: 40 }),
      ],
    }),
    new Paragraph({
      alignment: spec.centreHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [new TextRun({ text: contact, size: 20 })],
    }),
  ];

  /** Closing note: cleanup reminder, non-affiliation where relevant, one soft CTA. */
  const footer = (note: string): Paragraph[] => [
    new Paragraph({
      spacing: { before: 420 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB", space: 6 } },
      children: [new TextRun({ text: note, size: 16, italics: true, color: MUTED })],
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
  ];

  return { sectionHeading, entryLine, subLine, bullet, hint, body, labelled, header, footer };
}

export async function packDocument(
  spec: FormatSpec,
  meta: { title: string; description: string },
  children: Paragraph[]
): Promise<Buffer> {
  const doc = new Document({
    creator: "CVEdge",
    title: meta.title,
    description: meta.description,
    styles: {
      default: {
        document: {
          run: { font: spec.font, size: spec.bodySize },
          paragraph: { spacing: { line: spec.line } },
        },
      },
    },
    sections: [
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
