import { FormatSpec, makeBuilders, packDocument } from "./shared";

// Jake's Resume: a Word recreation of the MIT-licensed LaTeX template by Jake
// Gutierrez. The defining property is density — tight leading and a centred
// header, so a full internship and project history fits on one page without
// shrinking the type. Section order matches the original (Education,
// Experience, Projects, Technical Skills).
const SPEC: FormatSpec = {
  font: "Calibri",
  bodySize: 21, // 10.5pt — the original is compact by design
  nameSize: 34,
  line: 252,
  centreHeader: true,
  headingBefore: 240,
  headingRuleSize: 8,
};

export async function buildJakesDocx(): Promise<Buffer> {
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "Jake's Resume Template (Word)",
      description:
        "Word recreation of the Jake's Resume LaTeX layout by Jake Gutierrez (MIT licence) — single column, ATS-safe. Not affiliated with the author.",
    },
    [
      ...b.header(
        "YOUR NAME",
        "+1 000 000 0000 · your.email@example.com · linkedin.com/in/yourname · github.com/yourname"
      ),

      b.sectionHeading("Education"),
      b.hint(
        "The original puts Education first, which is right for students and new graduates and wrong within a couple of years of your first job. Move Experience above it once you have shipped anything."
      ),
      b.entryLine("University Name", "City, State"),
      b.subLine("B.S. in Computer Science", "Aug 2022 – May 2026"),

      b.sectionHeading("Experience"),
      b.hint(
        "Two lines per entry — title with dates on the right, then company with location. Bullets of one or two lines each. The tight leading is what lets a full internship history fit on one page."
      ),
      b.entryLine("Software Engineer Intern", "Jun 2025 – Aug 2025"),
      b.subLine("Company Name", "City, State"),
      b.bullet(
        "Start with the verb, name the result, attach the number: “Cut p95 API latency 42% by replacing an N+1 query with a batched loader.”"
      ),
      b.bullet("Say what you built and what it ran against — traffic, data volume, users."),
      b.bullet("One bullet on collaboration or scope if the role had any: reviews, on-call, design docs."),
      b.entryLine("Software Engineer Intern", "Jun 2024 – Aug 2024"),
      b.subLine("Company Name", "City, State"),
      b.bullet("Two bullets is enough for an earlier internship."),

      b.sectionHeading("Projects"),
      b.hint(
        "The section that carries new-grad applications, and the reason this template suits students. Name the stack in a parenthetical, then say what it does and which part was yours — “E-commerce site (React, Node)” tells a reader nothing."
      ),
      b.entryLine("Project Name (React, Node.js, PostgreSQL)", "Mar 2025"),
      b.bullet("What it does and who uses it, in one line."),
      b.bullet("The part that was technically hard, and how you solved it."),
      b.entryLine("Project Name (Python, PyTorch)", "Nov 2024"),
      b.bullet("One or two lines. Link the repo from the header rather than inline."),

      b.sectionHeading("Technical Skills"),
      b.hint(
        "Four grouped lines, not one undifferentiated block. This is where keyword matching does most of its work — mirror the vocabulary in the posting rather than your own shorthand, and resist padding: twelve languages reads as strong in none."
      ),
      b.labelled("Languages", "Python, Java, TypeScript, Go, SQL"),
      b.labelled("Frameworks", "React, Next.js, Node.js, Django, FastAPI"),
      b.labelled("Developer Tools", "Git, Docker, Kubernetes, AWS, Terraform"),
      b.labelled("Libraries", "pandas, NumPy, PyTorch, React Query"),

      ...b.footer(
        "Delete every italic prompt before you send this. Keep it to one page — cut a project rather than reducing the font size. A Word recreation of the Jake's Resume layout, originally a LaTeX template by Jake Gutierrez released under the MIT licence; not affiliated with or endorsed by its author. The original source is on GitHub and Overleaf."
      ),
    ]
  );
}
