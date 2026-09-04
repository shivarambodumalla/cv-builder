import { FormatSpec, makeBuilders, packDocument } from "./shared";

// Europass: the EU standard. The European Commission withdrew its downloadable
// Word template in the 2020 relaunch, so this is a recreation — it keeps the
// Europass sections and the CEFR language grid but drops the online editor's
// layout, which parses poorly. The grid is rendered as aligned text on tab
// stops rather than a real table, for the same reason.
const SPEC: FormatSpec = {
  font: "Calibri",
  bodySize: 22,
  nameSize: 34,
  line: 276,
  centreHeader: false,
  headingBefore: 280,
  headingRuleSize: 8,
};

export async function buildEuropassDocx(): Promise<Buffer> {
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "Europass CV Template",
      description:
        "Blank Europass-format CV with the CEFR language grid — single column and ATS-safe. Not affiliated with the European Commission.",
    },
    [
      ...b.header(
        "FIRST NAME LAST NAME",
        "Street, Postcode City, Country · your.email@example.com · +00 000 000000 · linkedin.com/in/yourname"
      ),
      b.hint(
        "Nationality, date of birth and a photo are expected in parts of continental Europe and inadvisable in the UK, Ireland and North America. Include them only where the destination expects them."
      ),

      b.sectionHeading("About Me"),
      b.hint(
        "Three or four lines, descriptive rather than promotional. European public-sector readers in particular treat overt self-marketing as a negative signal — state what you do, at what level, in which domain."
      ),
      b.body(
        "[Job title] with 00 years' experience in [domain], currently at [organisation] in [city, country]. Focused on [specialism]. Seeking [type of role] in [country or institution]."
      ),

      b.sectionHeading("Work Experience"),
      b.hint(
        "Reverse chronological with month and year. Europass expects the employer's town, country and sector — more institutional context than an Anglo-American CV carries, because the reader may not recognise the organisation."
      ),
      b.entryLine("Job Title", "01/2022 – Present"),
      b.subLine("Employer, Town, Country — Sector"),
      b.bullet("Main activity or responsibility, with the outcome and a number."),
      b.bullet("Scale: budget, headcount, markets, contract value."),
      b.entryLine("Job Title", "03/2019 – 12/2021"),
      b.subLine("Employer, Town, Country — Sector"),
      b.bullet("Two or three points per role."),

      b.sectionHeading("Education and Training"),
      b.hint(
        "Include the EQF level where you know it. The European Qualifications Framework is the mechanism that makes a degree comparable across borders, and it is the single most useful field on the form for a cross-border application."
      ),
      b.entryLine("Qualification, Subject", "09/2015 – 06/2019"),
      b.subLine("Awarding Institution, Town, Country — EQF level 0"),

      b.sectionHeading("Language Skills"),
      b.hint(
        "The distinctive Europass section. Rate each skill separately on the A1–C2 CEFR scale, not one overall level. These are frequently tested at interview for EU institutional roles — an inflated C1 is found out quickly."
      ),
      b.labelled("Mother tongue", "Your first language"),
      b.body("OTHER LANGUAGES — Listening · Reading · Spoken interaction · Spoken production · Writing"),
      b.labelled("English", "C1 · C2 · B2 · B2 · C1"),
      b.labelled("German", "B1 · B2 · A2 · A2 · B1"),
      b.hint(
        "Rough guide: B1 manages everyday situations, B2 works comfortably in the language, C1 operates professionally including meetings and writing, C2 is effectively native. Most people read better than they speak, and the grid is designed to show that."
      ),

      b.sectionHeading("Digital Skills"),
      b.labelled("Tools and platforms", "Software, systems and platforms, comma separated."),
      b.labelled("Certifications", "Certification name, issuing body, year."),

      b.sectionHeading("Additional Information"),
      b.hint(
        "Optional. Driving licence category is expected in much of continental Europe and omitted almost everywhere else. Publications, projects, conferences and volunteering go here, and only if relevant."
      ),
      b.labelled("Driving licence", "Category B — remove if not relevant"),
      b.labelled("Publications / Projects", "Title, venue, year."),

      ...b.footer(
        "Delete every italic prompt before you send this. Two pages is the working maximum — Europass will happily let you produce five. A recreation of the European Union's Europass CV structure; not affiliated with or endorsed by the European Commission. The official service is at europa.eu/europass."
      ),
    ]
  );
}
