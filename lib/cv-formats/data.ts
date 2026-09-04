/**
 * Named CV formats that exist in the world independently of CVEdge.
 *
 * These are not templates in the product sense — they are conventions with
 * standing search demand, which is the property that made the Harvard page work:
 * people search the name because the artifact predates us. A visual design we
 * invented (Aurora, Coastal, Portrait) has no such demand, which is why those 23
 * template URLs earned four clicks between them.
 *
 * Kept separate from lib/resume-templates/data.ts on purpose. A format is a set
 * of conventions plus a downloadable file; a template is a renderer layout.
 * Mixing them would have put these pages under TEMPLATE_PRIMARY_CATEGORY and
 * canonicalised them away to whichever visual template they most resembled.
 *
 * Adding a fourth format is a data entry, not a new route — which is the point,
 * since the whole cluster is a probe and only the ones that move get more spend.
 */

export interface FormatSection {
  title: string;
  body: string;
}

export interface CvFormat {
  slug: string;
  /** Page name and H1. */
  name: string;
  metaTitle: string;
  metaDescription: string;
  /** Short eyebrow above the H1. */
  eyebrow: string;
  /** One-sentence promise under the H1. */
  headline: string;
  /** Where this format is used, for the reader's orientation. */
  market: string;
  /** Opening prose, one paragraph per entry. */
  intro: string[];
  /** What makes this format structurally distinct. */
  sections: FormatSection[];
  /** Mistakes specific to this format, not generic resume advice. */
  mistakes: string[];
  faqs: { question: string; answer: string }[];
  /** Slug passed to /api/templates/[template]/docx. */
  docxSlug: string;
  /** Attribution and non-affiliation, shown on the page and in the file. */
  attribution: string;
  /** hreflang entries, where the format is language- or region-bound. */
  languages?: Record<string, string>;
  /** Related in-product template to build online with instead. */
  buildOnline: { href: string; label: string };
}

export const CV_FORMATS: CvFormat[] = [
  {
    slug: "iim-resume",
    name: "IIM Resume Format",
    metaTitle: "IIM Resume Format — Free Word Template, One Page",
    metaDescription:
      "The one-page IIM resume format used in Indian B-school placements: academic marks table, Positions of Responsibility, achievement bullets. Free Word download, no account needed.",
    eyebrow: "India · B-school placements",
    headline:
      "The one-page format Indian B-school placement cells expect — marks table, Positions of Responsibility, and achievement bullets that carry numbers. Free as a Word file.",
    market: "IIM, ISB and Indian B-school placements; Indian campus recruiting generally",
    intro: [
      "The IIM resume format is a genuine convention rather than a design. It compresses an entire academic and professional record onto a single page, opens with a table of marks rather than a summary, and gives an unusual amount of space to leadership roles held outside work. If you have seen an Indian B-school placement resume, you have seen it: everyone's looks broadly the same, and that is deliberate — the format exists so recruiters can compare two hundred candidates on identical axes.",
      "It is worth being clear about one thing up front, because a lot of pages online are not. There is no official IIM resume template. The IIMs do not publish one. What exists is a strongly held convention, enforced in practice by each institute's placement committee, with small variations between IIM Ahmedabad, Bangalore and Calcutta. This template follows the common core that holds across all of them.",
      "The format is also unusually strict about length. One page is not a guideline here, it is the rule, and placement cells routinely send resumes back over it. That constraint is what drives every other choice below — the marks table instead of prose, the single-line bullets, the absence of an objective statement.",
    ],
    sections: [
      {
        title: "Academic qualifications — as a table, at the top",
        body: "Class X, Class XII and graduation, each with institute, board or university, year of completion, and marks as a percentage or CGPA. This goes first, above work experience, and it is non-negotiable: Indian recruiting screens on academic consistency, and a missing percentage reads as something being hidden. Include your B-school CGPA once you have one.",
      },
      {
        title: "Positions of Responsibility",
        body: "The section that has no equivalent in a Western resume, and the one candidates most often underweight. Committee roles, club leadership, fest coordination, student council — with the scale attached. \"Coordinated a 40-member team across a ₹12 lakh budget\" is doing real work here; \"Member, Marketing Club\" is not.",
      },
      {
        title: "Work experience and internships",
        body: "Reverse chronological, one or two lines each. Lead on the result with a number attached. Freshers put internships here rather than in a separate section — the placement cell reads it as the same thing at a smaller scale.",
      },
      {
        title: "Academic projects",
        body: "Two or three, with the method and the outcome. This is where pre-MBA engineers and analysts demonstrate technical depth that their job title does not convey. Drop the section entirely once you have three or more years of relevant work experience.",
      },
      {
        title: "Scholastic achievements and extra-curriculars",
        body: "Ranks, percentiles, scholarships, olympiads, national-level sport or music. Percentile beats rank where you have it — \"99.4 percentile, CAT 2024\" is legible to every reader, \"AIR 812\" is not without the denominator.",
      },
    ],
    mistakes: [
      "Adding a career objective or summary paragraph. It is not part of the convention and it costs you two lines you cannot spare on a one-page format.",
      "Omitting Class X or XII marks because they were weak. Placement cells notice the gap immediately, and an absent number reads worse than a mediocre one.",
      "Treating Positions of Responsibility as a list of memberships. The section is about scale and outcome — team size, budget, footfall, funds raised.",
      "Using a two-column layout copied from a Western template. Indian corporate ATS deployments are as literal as any other, and the placement cell will usually reject the format before a recruiter sees it.",
      "Running to a second page. One page is enforced, not advisory.",
      "Writing achievements without denominators. \"Ranked 3rd\" means nothing; \"Ranked 3rd of 480\" means something.",
    ],
    faqs: [
      {
        question: "Is there an official IIM resume template?",
        answer:
          "No. The IIMs do not publish one, and any page claiming to host the official file is mistaken. What exists is a convention enforced in practice by each institute's placement committee, with minor variations between campuses — IIM Ahmedabad, Bangalore and Calcutta each have house preferences about section order and how much detail belongs in Positions of Responsibility. This template follows the common core. If your placement cell issues its own format, use theirs.",
      },
      {
        question: "Should the IIM resume be strictly one page?",
        answer:
          "Yes. This is the one length rule in resume writing that is genuinely enforced rather than advisory — placement committees return resumes that run over. If you are spilling onto a second page, cut academic projects before you cut Positions of Responsibility, and compress pre-MBA work experience to one line per role.",
      },
      {
        question: "What is the Positions of Responsibility section for?",
        answer:
          "It captures leadership held outside paid work — committees, clubs, fests, student government, sports captaincy. Indian campus recruiting weights it heavily because it is the main evidence of leadership available for candidates with two or three years of experience. Write it the way you would write work experience: scale, action, outcome, number. A recruiter comparing two hundred profiles is looking for the one that says \"managed a ₹12 lakh budget across a 40-member team\", not the one that says \"active member\".",
      },
      {
        question: "Does this format work outside campus placements?",
        answer:
          "For lateral hiring in India, partly. The marks table stays useful for the first few years and then becomes noise — by year five, recruiters care about your last two roles. Once you are hiring laterally, move work experience above academics, drop academic projects, and keep Positions of Responsibility only where it shows scale you have not demonstrated at work. For applications outside India, use a standard single-column format instead: the marks table reads as unusual and personal-detail-heavy to US and UK recruiters.",
      },
      {
        question: "Is this format ATS-friendly?",
        answer:
          "The downloadable version here is: single column, standard headings, and the marks table rendered as aligned text rather than an actual table, since tables are among the most common causes of parsing failure. Many IIM resumes in circulation do use a real table for marks and do misparse as a result. If yours came from a batchmate rather than the placement cell, it is worth checking.",
      },
    ],
    docxSlug: "iim",
    attribution:
      "Named for the convention used across Indian B-school placements. Not affiliated with, endorsed by, or issued by the Indian Institutes of Management.",
    buildOnline: {
      href: "/resume-templates/ats-friendly/harvard-cv",
      label: "build a single-column CV online",
    },
  },

  {
    slug: "europass-cv",
    name: "Europass CV",
    metaTitle: "Europass CV Template — Free Word Download, EU Standard",
    metaDescription:
      "The EU's Europass CV format as a free Word file — the download the official site stopped offering in 2020. Includes the CEFR language grid. ATS-safe single column, no account needed.",
    eyebrow: "European Union · EURES and EPSO",
    headline:
      "The EU-standard CV, as a Word file you can actually edit — including the CEFR language grid. The official site stopped offering a download in 2020.",
    market: "EU and EEA applications, EURES, EPSO, and employers across Germany, France, Italy, Spain, Poland and the Netherlands",
    intro: [
      "Europass is the European Union's own CV standard. It exists so that a qualification earned in one member state is legible to an employer in another, and it is the expected format for EURES listings, EPSO applications to the EU institutions, and a great many public-sector and academic roles across the bloc.",
      "There is a practical problem with it, and it is the reason this page exists. Until the 2020 relaunch, the European Commission published a downloadable Word template. It no longer does — Europass is now an online editor built on a profile you create and log into, and there is no official file to take away. Every \"official Europass Word template\" you will find today is a third-party recreation. This one is too, and says so.",
      "The format's distinguishing feature is the CEFR language grid: listening, reading, spoken interaction, spoken production and writing, each rated A1 to C2 separately. It is more granular than the single \"fluent\" line most CVs carry, and for multilingual applications in Europe it is genuinely the thing being assessed.",
      "One honest caveat. The default Europass output is verbose and, in its online form, laid out in a way that parses poorly. Where an employer asks for Europass, use it. Where they do not, a plain single-column CV usually serves you better — this template keeps the Europass structure but drops the layout choices that cause parsing failures.",
    ],
    sections: [
      {
        title: "Personal information",
        body: "Name, address, phone, email, and optionally nationality and date of birth. Europass has historically prompted for more personal data than is wise elsewhere — nationality and date of birth are genuinely expected in parts of the EU and genuinely inadvisable for UK, Irish and North American applications. Include them only where the destination expects them.",
      },
      {
        title: "About me",
        body: "Three or four lines. Unlike a US summary, this is descriptive rather than promotional — European public-sector readers in particular treat overt self-marketing as a negative signal. State what you do, at what level, and in which domain.",
      },
      {
        title: "Work experience",
        body: "Reverse chronological with month and year. Europass expects the employer's name, town and country, and the sector — more institutional context than an Anglo-American CV carries, because the reader may not recognise the organisation.",
      },
      {
        title: "Education and training",
        body: "Qualification, awarding institution, dates, and where possible the EQF level. The European Qualifications Framework level is the mechanism that makes a degree comparable across borders, and it is the single most useful field on the form for a cross-border application.",
      },
      {
        title: "Language skills — the CEFR grid",
        body: "The distinctive section. Mother tongue first, then each other language rated separately for listening, reading, spoken interaction, spoken production and writing, on the A1–C2 scale. Rate yourself honestly: these are frequently tested at interview for EU institutional roles, and an inflated C1 is found out quickly.",
      },
      {
        title: "Digital skills, driving licence and additional sections",
        body: "Digital competences follow their own EU framework and can be listed plainly. A driving licence category is expected in much of continental Europe and omitted almost everywhere else. Publications, projects, conferences and volunteering go at the end, and only if relevant.",
      },
    ],
    mistakes: [
      "Rating every language C2. The CEFR grid exists precisely to stop the vague self-assessment that \"fluent\" allows, and interviewers for EU roles test it.",
      "Using Europass where the employer did not ask for it. Outside EURES, EPSO and the public sector, a plain single-column CV is usually the stronger document.",
      "Carrying nationality, date of birth and a photo into applications outside continental Europe. What is routine in Italy or Spain is a discrimination risk in the UK, Ireland and North America.",
      "Filling every prompted field because the form offers it. Europass will happily let you produce five pages. Two is the working maximum.",
      "Leaving the EQF level blank on a cross-border application. It is the field that makes your qualification comparable, and it is the reason the format exists.",
      "Assuming the online editor's output is ATS-safe. Its default layout is one of the reasons this Word version exists.",
    ],
    faqs: [
      {
        question: "Where is the official Europass Word template?",
        answer:
          "There is not one any more. The European Commission withdrew the downloadable template in the 2020 relaunch; Europass today is an online editor built on a profile you create at europa.eu/europass, and the output is generated rather than downloaded as a source file. Every \"official Europass template in Word\" circulating online is a third-party recreation of the format. This page's file is one as well, and is not affiliated with the European Commission.",
        },
      {
        question: "Is a Europass CV ATS-friendly?",
        answer:
          "The format's structure is fine; its usual presentation is not. The online editor's default output uses layout constructs that parse unreliably, which is a real problem given how many EU employers run the same applicant tracking systems as everyone else. The version here keeps the Europass sections and the CEFR grid but renders them as a single column of plain text with standard headings, so the content survives the parse.",
      },
      {
        question: "Do I have to use Europass to apply for jobs in Europe?",
        answer:
          "No, and it is often the wrong choice. It is expected for EURES listings, EPSO applications to the EU institutions, many public-sector roles, and some academic and research posts. For private-sector applications in Germany, France or the Netherlands, the national convention or a plain single-column CV typically reads better — a Europass CV sent to a Berlin startup can look like the applicant did not know what else to send.",
      },
      {
        question: "What are CEFR levels and how should I rate myself?",
        answer:
          "The Common European Framework of Reference grades language ability from A1 (beginner) to C2 (near-native), and Europass asks you to rate five skills separately rather than giving one overall level. A rough guide: B1 is managing everyday situations, B2 is working comfortably in the language, C1 is operating professionally including in meetings and writing, C2 is effectively native. Most people are stronger at reading than at spoken production, and the grid is designed to show exactly that.",
      },
      {
        question: "Should I include a photo on a Europass CV?",
        answer:
          "It depends entirely on the destination country. Normal in Germany, Spain, Italy, Portugal and much of central Europe; inadvisable in the UK and Ireland, where employers frequently discard applications carrying photos to avoid discrimination claims. Europass makes the photo optional, which is the correct default — add it only when applying somewhere it is expected.",
      },
    ],
    docxSlug: "europass",
    attribution:
      "A recreation of the European Union's Europass CV structure. Not affiliated with, endorsed by, or issued by the European Commission. The official Europass service is at europa.eu/europass.",
    languages: {
      "en-GB": "https://www.thecvedge.com/cv-format/europass-cv",
      "en-IE": "https://www.thecvedge.com/cv-format/europass-cv",
      "x-default": "https://www.thecvedge.com/cv-format/europass-cv",
    },
    buildOnline: {
      href: "/resume-templates/ats-friendly/classic-cv",
      label: "build a single-column CV online",
    },
  },

  {
    slug: "jakes-resume",
    name: "Jake's Resume Template",
    metaTitle: "Jake's Resume Template — Free Word Version, No LaTeX",
    metaDescription:
      "The Jake's Resume layout as an editable Word file — same structure, no LaTeX and no Overleaf account. Single column, ATS-safe, free download. MIT-licensed original by Jake Gutierrez.",
    eyebrow: "Software engineering · the LaTeX standard",
    headline:
      "The most-used LaTeX resume among software engineers, rebuilt as a Word file. Same structure and reading order — without Overleaf or a single line of .tex.",
    market: "Software engineering, new-grad and intern applications, technical roles generally",
    intro: [
      "Jake's Resume is the template a large share of computer science students and working engineers actually use. It is a compact single-column LaTeX layout — Education, Experience, Projects, Technical Skills — written by Jake Gutierrez and released under the MIT licence, and it became the default largely because it is disciplined: tight spacing, no ornament, and just enough room for one page of real content.",
      "The friction is LaTeX. Using the original means an Overleaf account, compiling a .tex file, and editing markup to change a bullet. That is fine if you already work that way and a genuine obstacle if you do not — and it is why people search for the template far more often than they finish one.",
      "This is the same layout as an editable Word document. Identical section order, identical entry structure with the role on the left and dates flush right, the same compact spacing. What it is not is the original file: if you want the .tex source, it is on GitHub and Overleaf, and you should get it there.",
      "The layout also happens to be a strong ATS candidate, which is not why it became popular but is worth knowing. Single column, standard headings, no tables and no graphics — the four things that actually decide whether a parser reads your resume in the order you wrote it.",
    ],
    sections: [
      {
        title: "Education first — but only while it earns the position",
        body: "The original puts Education at the top, which is correct for students and new graduates and wrong within a couple of years of your first job. Move Experience above it once you have shipped anything. The template's structure does not change; only the order does.",
      },
      {
        title: "Experience — role left, dates flush right",
        body: "Each entry is two lines: job title with dates on the right, then company with location on the right. Bullets underneath, one or two lines each. The tight leading is doing real work — it is what lets a full internship history fit on one page without shrinking the type.",
      },
      {
        title: "Projects — the section that carries new-grad applications",
        body: "The reason this template suits students specifically. Each project gets a name, its stack in a parenthetical, and one or two bullets on what it does and what you built. For a candidate without much work history, this section is the evidence, and it deserves as much space as Experience.",
      },
      {
        title: "Technical skills — grouped, not listed",
        body: "Languages, frameworks, developer tools, libraries — as four labelled lines rather than one undifferentiated block. This is where keyword matching does most of its work, so mirror the vocabulary in the job posting rather than your own shorthand.",
      },
    ],
    mistakes: [
      "Keeping Education at the top three years into a career, because the template put it there. The order is a default for students, not a rule.",
      "Filling the page because the tight spacing allows it. The layout fits more; that is not an instruction to include more.",
      "Listing projects without saying what you built. \"E-commerce site (React, Node)\" tells a reader nothing — what did it do, and which part was yours?",
      "Padding the skills section with everything ever touched. A recruiter reading twelve languages assumes you are strong in none of them.",
      "Reducing the font to squeeze onto one page. Cut a project instead; sub-10pt type reads as desperation and parses worse.",
      "Sending the compiled PDF without checking it parses. Some LaTeX PDF output extracts in the wrong reading order — worth running through a checker whichever version you use.",
    ],
    faqs: [
      {
        question: "Is this the actual Jake's Resume template?",
        answer:
          "It is the same layout, not the same file. The original is a LaTeX template by Jake Gutierrez, released under the MIT licence and available on GitHub and Overleaf — if you want the .tex source, get it from there. This is a Word recreation with the same section order, entry structure and spacing, for people who would rather not compile anything. Layouts are not themselves copyrightable and the original is permissively licensed, but the credit belongs to its author.",
      },
      {
        question: "Why use the Word version instead of LaTeX?",
        answer:
          "Because the LaTeX toolchain is the reason most people who find this template never finish one. If you already use Overleaf, the original is better — you get the typographic precision LaTeX is for. If you do not, an Overleaf account and a compile cycle to fix a typo is a poor trade for a layout you can have directly.",
      },
      {
        question: "Is Jake's Resume ATS-friendly?",
        answer:
          "The layout is: one column, standard heading names, no tables, no text boxes, no graphics. That covers the failure modes that actually matter. One caveat specific to the LaTeX original — PDF output from LaTeX occasionally extracts in an unexpected reading order depending on how the document is compiled, so it is worth running the compiled file through a checker. The Word version here parses cleanly, verified against the same library CVEdge uses to read uploads.",
      },
      {
        question: "Is Jake's Resume good for experienced engineers?",
        answer:
          "Yes, with two changes. Move Experience above Education, and cut Projects down or drop it — past about five years, personal projects compete for space with work that a recruiter weights more heavily. The compact spacing is arguably more useful to a senior engineer than to a student, because it is what lets fifteen years fit on two pages without the document feeling crowded.",
      },
      {
        question: "What about Deedy, Awesome CV and the other LaTeX templates?",
        answer:
          "Different tools for different situations. Deedy is two-column with a narrow sidebar, which looks sharp and carries some parsing risk. Awesome CV is built for longer academic documents. Jake's is the plainest of the three and the safest through an ATS, which is why it is the one recreated here first.",
      },
    ],
    docxSlug: "jakes",
    attribution:
      "A Word recreation of the Jake's Resume layout, originally a LaTeX template by Jake Gutierrez, released under the MIT licence. Not affiliated with or endorsed by its author. The original source is on GitHub and Overleaf.",
    buildOnline: {
      href: "/resume-templates/software-engineer/classic-cv",
      label: "build a single-column CV online",
    },
  },
];

export const FORMAT_MAP = new Map(CV_FORMATS.map((f) => [f.slug, f]));

export function getCvFormat(slug: string): CvFormat | undefined {
  return FORMAT_MAP.get(slug);
}
