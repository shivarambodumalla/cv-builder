import { FormatSpec, makeBuilders, packDocument } from "./shared";

// Executive: corporate convention. Sans face, left-aligned header, summary
// first, generous leading, and a heavier rule under headings — the premium feel
// comes entirely from spacing and type weight, never from graphics, so the file
// stays as parseable as the plainest format on the site.
const SPEC: FormatSpec = {
  font: "Calibri",
  bodySize: 22, // 11pt
  nameSize: 36, // 18pt — larger than Harvard's; seniority reads in the header
  line: 300,
  centreHeader: false,
  headingBefore: 300,
  headingRuleSize: 12,
};

/**
 * A blank Executive-format resume for senior candidates.
 *
 * Differs from Harvard in the two ways that matter at this level: a Professional
 * Summary leads, and the experience section is shaped for curation — recent
 * roles expand, early roles compress to one line each. The prompts push toward
 * scope and P&L rather than coursework.
 */
export async function buildExecutiveDocx(): Promise<Buffer> {
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "Executive Resume Template",
      description:
        "Blank executive resume template for C-suite, VP and director roles — single column, ATS-safe.",
    },
    [
      ...b.header(
        "YOUR NAME",
        "Your Target Title  ·  City, Country  ·  your.email@example.com  ·  +00 0000 000000  ·  linkedin.com/in/yourname"
      ),

      b.sectionHeading("Professional Summary"),
      b.hint(
        "Three or four lines, and the most-read part of a senior resume. State your level, your domain, the scale you operate at, and the one outcome you want remembered. Write it last, once the rest of the page exists."
      ),
      b.body(
        "Operating executive with 00 years across [industry], currently accountable for [scope: P&L size, headcount, region]. Track record of [the outcome you are hired for] — most recently [single strongest result, with a number]."
      ),

      b.sectionHeading("Experience"),
      b.hint(
        "Full detail for the last 10–15 years; company, title and dates only for anything earlier. An undifferentiated twenty-year list reads as an inability to prioritise."
      ),
      b.entryLine("Company Name", "City, Country"),
      b.subLine("Chief / VP / Director of Function", "Jan 2021 – Present"),
      b.body(
        "One line of context the reader will not know: company size, revenue, stage, or what you were brought in to fix.",
        { spacing: { before: 20, after: 60 } }
      ),
      b.bullet(
        "Lead on scope, not activity: “Owned a £00m P&L across three markets, growing contribution margin from 00% to 00% in two years.”"
      ),
      b.bullet(
        "Name what you built or changed structurally — a team, a function, an operating model — and the size of it."
      ),
      b.bullet(
        "One bullet should be a decision you made that carried risk, and how it resolved. Senior readers look for judgement."
      ),
      b.entryLine("Previous Company", "City, Country"),
      b.subLine("Your Job Title", "Mar 2017 – Dec 2020"),
      b.bullet("Two or three bullets. Recency earns space."),
      b.bullet("Keep the metric density up — at this level, unquantified claims read as filler."),
      b.entryLine("Earlier Career", ""),
      b.body(
        "Company — Title (2012–2017)  ·  Company — Title (2009–2012)  ·  Company — Title (2006–2009)",
        { spacing: { before: 20, after: 60 } }
      ),
      b.hint(
        "Compress everything beyond about fifteen years into a single line like the one above. It signals range without spending a third of the page on it."
      ),

      b.sectionHeading("Board, Advisory & Governance"),
      b.hint(
        "Optional, and worth keeping only if you hold appointments. Delete the section otherwise — an empty heading is worse than no heading."
      ),
      b.entryLine("Organisation", "2022 – Present"),
      b.subLine("Non-Executive Director / Advisor / Trustee"),

      b.sectionHeading("Education & Credentials"),
      b.hint(
        "Brief at this level. Institution, qualification, year. Drop grades and coursework entirely — nobody is checking a 2:1 from 1998."
      ),
      b.entryLine("Business School or University", "2004"),
      b.subLine("MBA / Degree, Subject"),
      b.labelled("Certifications", "Certification name, issuing body, year."),
      b.labelled("Languages", "Language (level), Language (level)."),

      b.sectionHeading("Selected Achievements"),
      b.hint(
        "Optional. Use it when a career-defining result would otherwise be buried three roles down the page."
      ),
      b.bullet("The single result you would lead with in a first conversation, with its number."),

      ...b.footer(
        "Delete every italic prompt before you send this. Two pages is standard at executive level — if you are spilling onto a third, compress early roles rather than tightening the spacing."
      ),
    ]
  );
}
