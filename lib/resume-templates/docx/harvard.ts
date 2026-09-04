import { FormatSpec, makeBuilders, packDocument } from "./shared";

// Harvard: academic convention. Serif face, centred header, education first,
// tight leading, hairline rules under headings.
const SPEC: FormatSpec = {
  font: "Times New Roman",
  bodySize: 22, // 11pt
  nameSize: 32, // 16pt
  line: 264,
  centreHeader: true,
  headingBefore: 260,
  headingRuleSize: 6,
};

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
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "Harvard Resume Template",
      description:
        "Blank Harvard-format resume template — single column, ATS-safe. Not affiliated with Harvard University.",
    },
    [
      ...b.header(
        "YOUR NAME",
        "City, Country · your.email@example.com · +00 0000 000000 · linkedin.com/in/yourname"
      ),

      b.sectionHeading("Education"),
      b.hint(
        "Education leads while you are a student or within a year or two of graduating. Once you have more professional experience than academic credentials, move this section below Experience."
      ),
      b.entryLine("University Name", "City, Country"),
      b.subLine("Degree, Subject — Grade or honours", "Sept 2020 – June 2024"),
      b.bullet("Relevant coursework, thesis title, or an academic award worth naming."),
      b.bullet("A society, committee or leadership role, if it shows something a job cannot."),

      b.sectionHeading("Experience"),
      b.hint(
        "Reverse chronological. Lead each bullet with what changed, not what you were assigned — the format gives you no visual hierarchy to hide behind, so weak lines are conspicuous."
      ),
      b.entryLine("Company Name", "City, Country"),
      b.subLine("Your Job Title", "Jan 2024 – Present"),
      b.bullet(
        "Start with a strong past-tense verb, state the result, and attach a number: “Reduced onboarding time 40% by rewriting the setup flow.”"
      ),
      b.bullet("Name the scale you worked at — users, revenue, team size, requests, budget."),
      b.bullet("Keep each bullet to one or two lines. Three is a paragraph pretending to be a bullet."),
      b.entryLine("Previous Company", "City, Country"),
      b.subLine("Your Job Title", "Jun 2022 – Dec 2023"),
      b.bullet("Two or three bullets is enough for older roles. Recency earns space."),

      b.sectionHeading("Skills & Certifications"),
      b.hint(
        "This is where keyword matching does most of its work. Mirror the vocabulary of the postings you are targeting rather than your own internal jargon."
      ),
      b.labelled("Technical", "List tools, languages and platforms, comma separated."),
      b.labelled("Certifications", "Certification name, issuing body, year."),
      b.labelled("Languages", "Language (level), Language (level)."),

      b.sectionHeading("Projects, Publications & Awards"),
      b.hint(
        "Optional. Keep it if it carries weight for the role you are applying to; delete the whole section if it does not."
      ),
      b.entryLine("Project, paper or award title", "2024"),
      b.bullet("One line on what it was and why it mattered."),

      ...b.footer(
        "Delete every italic prompt before you send this. Named for the format described in Harvard's career-services guidance; not affiliated with or endorsed by Harvard University."
      ),
    ]
  );
}
