import { Suspense } from "react";
import type { Metadata } from "next";
import { UploadResumeContent } from "./upload-resume-content";
import { BreadcrumbJsonLd, ServiceJsonLd, FaqJsonLd } from "@/components/shared/structured-data";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker | Upload Your CV",
  description: "Upload your resume and get an instant ATS score. Find out why you're not getting callbacks and fix it in minutes.",
  openGraph: {
    title: "Free ATS Resume Checker | CVEdge",
    description: "Upload your resume and get an instant ATS score. Fix it in minutes.",
    url: "https://www.thecvedge.com/upload-resume",
    images: ["/og-ats-checker.png"],
  },
  alternates: { canonical: "https://www.thecvedge.com/upload-resume" },
};

export default function UploadResumePage() {
  // Only the interactive tool sits behind Suspense. Everything else must render
  // in the initial HTML — with the explainer inside the boundary, SSR emitted
  // the fallback and the page served 68 words of nav and footer to a crawler.
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "ATS Resume Checker", url: "https://www.thecvedge.com/upload-resume" },
        ]}
      />
      <ServiceJsonLd
        name="Free ATS Resume Checker"
        description="Upload your CV or paste text to instantly check your ATS score. CVEdge analyses your resume across 6 categories — keywords, formatting, measurable results, bullet quality, sections, and contact info — and shows you exactly what to fix."
        url="https://www.thecvedge.com/upload-resume"
        serviceType="ATS Resume Analysis"
      />
      <Suspense fallback={<div />}>
        <UploadResumeContent />
      </Suspense>
      <AtsCheckerExplainer />
    </>
  );
}

/**
 * Server-rendered explanation of what the checker does.
 *
 * The tool itself is a client component behind Suspense, so without this the
 * page renders as nothing but navigation and footer to a crawler — on the
 * site's highest-priority conversion URL.
 */
function AtsCheckerExplainer() {
  return (
    <section className="container mx-auto max-w-3xl px-4 pb-20">
      <div className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight mb-4">What the ATS checker looks at</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          An applicant tracking system parses your CV into structured fields before anyone reads it — contact block,
          work history, skills, education. Anything that breaks that parse is invisible to you and decisive for your
          application. CVEdge scores your CV across the six categories that determine whether it survives.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ATS_CATEGORIES.map((c) => (
            <div key={c.name} className="rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight mb-4">How to read your score</h2>
        <div className="space-y-3">
          {SCORE_BANDS.map((b) => (
            <div key={b.band} className="flex items-start gap-4 rounded-xl border bg-card p-4">
              <span className="text-sm font-bold shrink-0 w-16">{b.band}</span>
              <div>
                <p className="text-sm font-semibold">{b.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Questions about ATS scoring</h2>
        <div className="space-y-3">
          {ATS_FAQ.map((f) => (
            <details key={f.question} className="rounded-xl border bg-card p-5 group">
              <summary className="cursor-pointer list-none font-semibold text-sm flex items-start justify-between gap-3">
                <span>{f.question}</span>
                <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <FaqJsonLd items={ATS_FAQ} />
    </section>
  );
}

const ATS_CATEGORIES = [
  { name: "Contact details", detail: "Whether your name, email and phone are extractable. Details placed in a document header are frequently not read at all, which can make you unreachable." },
  { name: "Sections", detail: "Whether standard headings — Experience, Education, Skills — are present and recognised. Content under an unconventional heading may be dropped from the parsed record." },
  { name: "Keywords", detail: "Coverage of the vocabulary used in the roles you are targeting, including where your phrasing differs from the posting's for the same skill." },
  { name: "Measurable results", detail: "How many bullets carry a number. Bullets describing responsibilities rather than outcomes are the most common reason a CV reads as unremarkable." },
  { name: "Bullet quality", detail: "Whether bullets open with a strong action verb and state what changed, rather than starting with \"Responsible for\"." },
  { name: "Formatting", detail: "Tables, text boxes, multi-column layouts, icons and image-based text — the choices that corrupt reading order or extract as nothing." },
];

const SCORE_BANDS = [
  { band: "90+", label: "Interview ready", detail: "Parses cleanly and reads as relevant. Further effort is better spent on the strength of your bullets than on the score." },
  { band: "75–89", label: "Strong profile", detail: "No structural problems. Usually a keyword-alignment gap against the specific roles you are applying to." },
  { band: "60–74", label: "Needs improvement", detail: "Typically a missing skills section, unmeasured bullets, or vocabulary that does not match the postings." },
  { band: "Under 60", label: "At risk", detail: "Usually a parsing failure — contact details in a header, a table-based layout, or text embedded in an image." },
];

const ATS_FAQ = [
  {
    question: "Is the ATS check really free?",
    answer:
      "Yes. Upload a CV or paste its text and you get the full category breakdown and the specific issues found, without an account or a card. Free accounts also include a number of AI rewrites and job matches each week; unlimited use requires a paid plan.",
  },
  {
    question: "What file formats can I upload?",
    answer:
      "PDF and DOCX, or you can paste plain text. One caveat worth knowing: a PDF exported as an image contains no selectable text, so neither our checker nor a real applicant tracking system can read it. If your CV came out of a design tool, check that you can select the text in it.",
  },
  {
    question: "Does a high ATS score guarantee interviews?",
    answer:
      "No, and it is worth being clear about that. The score measures whether your CV is machine-readable and relevant to a target role — it cannot measure whether your experience is compelling. A 95% score on vague, unmeasured bullets will still lose to a 78% CV that clearly shows someone shipped valuable work. Treat the score as a floor to clear, not a number to maximise.",
  },
  {
    question: "Do you store my CV?",
    answer:
      "Your CV is processed to generate the analysis. If you are signed in, it is saved to your account so you can edit and re-score it; you can delete it at any time. See our privacy policy for the full detail on retention and processing.",
  },
  {
    question: "Why does my CV score differently on other tools?",
    answer:
      "Different checkers weight the categories differently and use different keyword sets, so absolute scores are not comparable between tools. What is comparable is the direction of travel within one tool: fix the issues it names, re-run it, and confirm the categories you targeted actually moved.",
  },
];
