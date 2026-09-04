import { FormatSpec, makeBuilders, packDocument } from "./shared";

// IIM: Indian B-school placement convention. Tight leading and 10.5pt body,
// because one page is enforced rather than advisory. The marks table is the
// defining feature and is rendered as aligned text on tab stops, never as a
// real table — tables are among the most common causes of parsing failure, and
// many IIM resumes in circulation misparse for exactly that reason.
const SPEC: FormatSpec = {
  font: "Calibri",
  bodySize: 21, // 10.5pt — the page is one page whatever else happens
  nameSize: 30,
  line: 252,
  centreHeader: true,
  headingBefore: 240,
  headingRuleSize: 8,
};

export async function buildIimDocx(): Promise<Buffer> {
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "IIM Resume Format",
      description:
        "Blank one-page IIM-style resume for Indian B-school placements — marks table, Positions of Responsibility, single column and ATS-safe.",
    },
    [
      ...b.header(
        "YOUR NAME",
        "your.email@example.com · +91 00000 00000 · linkedin.com/in/yourname · City"
      ),

      b.sectionHeading("Academic Qualifications"),
      b.hint(
        "This table goes first — above work experience — and every row needs a number. A missing percentage reads as something being hidden, which costs you more than a mediocre mark would."
      ),
      b.entryLine("PGDM / MBA — Institute Name", "CGPA 0.00 / 4.00"),
      b.subLine("Specialisation", "2024 – 2026"),
      b.entryLine("B.Tech / B.Com / BA — College, University", "00.0%"),
      b.subLine("Branch or subject", "2019 – 2023"),
      b.entryLine("Class XII — School, Board", "00.0%"),
      b.subLine("Stream", "2019"),
      b.entryLine("Class X — School, Board", "00.0%"),
      b.subLine("Secondary school certificate", "2017"),

      b.sectionHeading("Work Experience"),
      b.hint(
        "Reverse chronological, one or two lines per role. Lead on the result with a number attached. Freshers put internships here rather than in a separate section."
      ),
      b.entryLine("Company Name", "City"),
      b.subLine("Your Role", "Jun 2023 – Apr 2024"),
      b.bullet(
        "Result first, with the number: “Cut invoice cycle time 34% by automating a three-stage manual approval, saving 120 hours a month.”"
      ),
      b.bullet("Name the scale — revenue touched, users, team size, geography, ₹ value."),
      b.entryLine("Internship — Company Name", "City"),
      b.subLine("Your Role", "May 2022 – Jul 2022"),
      b.bullet("One line. Internships earn one line each unless the outcome was unusual."),

      b.sectionHeading("Positions of Responsibility"),
      b.hint(
        "The section with no Western equivalent, and the one candidates most often underweight. Write it like work experience: scale, action, outcome, number. “Member, Marketing Club” is not doing any work here."
      ),
      b.entryLine("Role — Committee, Club or Body", "2024 – 2025"),
      b.bullet(
        "“Led a 40-member team across a ₹12 lakh budget to deliver a three-day fest with 6,000 footfall.”"
      ),
      b.entryLine("Role — Committee, Club or Body", "2021 – 2022"),
      b.bullet("Scale first. Team size, budget, funds raised, events run, people reached."),

      b.sectionHeading("Academic Projects"),
      b.hint(
        "Two or three, with the method and the outcome. Drop this section entirely once you have three or more years of relevant work experience — it competes for space you need elsewhere."
      ),
      b.entryLine("Project Title", "2025"),
      b.bullet("What the problem was, what method you used, and what the result showed."),

      b.sectionHeading("Scholastic Achievements & Extra-Curriculars"),
      b.hint(
        "Percentile beats rank wherever you have it — “99.4 percentile, CAT 2024” is legible to every reader; “AIR 812” is not without the denominator."
      ),
      b.bullet("Rank or percentile, exam or competition, year, and the field size."),
      b.bullet("Scholarships, olympiads, national-level sport or music, with the level stated."),

      ...b.footer(
        "Delete every italic prompt before you send this. One page is enforced by most placement cells, not advisory — if you are running over, cut Academic Projects before Positions of Responsibility. Named for the convention used across Indian B-school placements; not affiliated with or endorsed by the Indian Institutes of Management."
      ),
    ]
  );
}
