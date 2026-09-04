import { FormatSpec, makeBuilders, packDocument } from "./shared";

// GCC: Gulf convention. Sans face, left-aligned header, and the one structural
// difference from a Western resume — a Personal Details block carrying
// nationality, visa status and notice period, which Gulf recruiters expect and
// screen on. Still a single ATS-safe column: the extra fields are plain
// label/value lines, not a table, so nothing about the convention costs you a
// parse.
const SPEC: FormatSpec = {
  font: "Calibri",
  bodySize: 22,
  nameSize: 34,
  line: 276,
  centreHeader: false,
  headingBefore: 280,
  headingRuleSize: 8,
};

/**
 * A blank GCC-format CV for UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman.
 *
 * The Gulf convention differs from a US resume in ways that are specific and
 * checkable rather than stylistic — a photo is normal, personal details are
 * expected, notice period and visa status are screened on, and Arabic
 * proficiency is worth stating. Everything here reflects that; the layout stays
 * single-column so it survives the ATS the employer runs anyway.
 */
export async function buildGccDocx(): Promise<Buffer> {
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "GCC CV Template (UAE, Saudi Arabia, Qatar)",
      description:
        "Blank Gulf-format CV template with the personal details block GCC employers expect — single column, ATS-safe.",
    },
    [
      ...b.header(
        "YOUR NAME",
        "Your Target Title  ·  Dubai, UAE  ·  your.email@example.com  ·  +971 00 000 0000  ·  linkedin.com/in/yourname"
      ),
      b.hint(
        "A photo is normal in the Gulf and unusual almost everywhere else. If you include one, put it top-right in Word — never in the page header, which most parsers never read."
      ),

      b.sectionHeading("Personal Details"),
      b.hint(
        "This block is the main structural difference from a US or UK CV, and Gulf recruiters screen on it. Visa status and notice period in particular decide whether you are shortlisted, because they decide how fast you can start."
      ),
      b.labelled("Nationality", "Your nationality"),
      b.labelled("Visa status", "e.g. Employment visa (transferable) / Visit visa / Golden visa / Requires sponsorship"),
      b.labelled("Notice period", "e.g. 30 days / Immediate"),
      b.labelled("Current location", "e.g. Dubai, UAE — resident since 2021"),
      b.labelled("Driving licence", "e.g. Valid UAE licence"),
      b.labelled("Languages", "English (fluent), Arabic (conversational), Hindi (native)"),
      b.hint(
        "Date of birth, marital status and passport number still appear on many Gulf CVs. They are optional and carry discrimination risk if you also apply in Europe or North America — include them only if a specific employer asks."
      ),

      b.sectionHeading("Professional Summary"),
      b.hint(
        "Three or four lines. Name your regional experience explicitly — “six years in the UAE” is itself a qualification here, because it signals you understand the market and will not need relocating."
      ),
      b.body(
        "[Job title] with 00 years' experience, including 00 in the GCC. Currently [scope] at [company] in [city]. Strongest in [specialism], most recently [result with a number]."
      ),

      b.sectionHeading("Experience"),
      b.hint(
        "Reverse chronological. Name the country for every role — Gulf recruiters read regional experience as a distinct credential, and a reader cannot infer it from a company name."
      ),
      b.entryLine("Company Name", "Dubai, UAE"),
      b.subLine("Your Job Title", "Jan 2022 – Present"),
      b.bullet(
        "Lead with the result and a number: “Cut supplier onboarding from 21 days to 6 across three GCC markets.”"
      ),
      b.bullet("Name the scale — budget in AED/SAR, headcount, markets covered, contract values."),
      b.bullet("Where a project was government or semi-government, say so. It reads as relevant experience."),
      b.entryLine("Previous Company", "Riyadh, Saudi Arabia"),
      b.subLine("Your Job Title", "Jun 2019 – Dec 2021"),
      b.bullet("Two or three bullets for older roles."),

      b.sectionHeading("Education & Certifications"),
      b.hint(
        "State the country of your qualification. Some Gulf employers and most government roles require attestation of foreign degrees, so make the origin easy to find."
      ),
      b.entryLine("University Name", "City, Country"),
      b.subLine("Degree, Subject", "2015 – 2019"),
      b.labelled("Certifications", "Certification name, issuing body, year."),
      b.labelled("Attestation", "e.g. Degree attested by MOFA UAE (2022) — remove if not applicable"),

      b.sectionHeading("Skills"),
      b.hint(
        "Mirror the vocabulary of the posting. This is where keyword matching does most of its work, and Gulf postings are often more literal than Western ones about naming tools and standards."
      ),
      b.labelled("Technical", "Tools, platforms and standards, comma separated."),
      b.labelled("Domain", "Sector-specific expertise — oil & gas, construction, banking, logistics."),

      ...b.footer(
        "Delete every italic prompt before you send this. Keep it to two pages; the personal details block is expected in the Gulf but should not push your experience onto a third page."
      ),
    ]
  );
}
