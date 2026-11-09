import { Suspense } from "react";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { ResumeCheckerContent } from "./resume-checker-content";
import { BreadcrumbJsonLd, ServiceJsonLd, FaqJsonLd } from "@/components/shared/structured-data";

export const metadata: Metadata = {
  title: "Free Resume Checker: Instant ATS Score and Top Issues",
  description: "Check your resume free. Upload a PDF and get an ATS score across six categories plus your top issues in under 60 seconds. Pro shows the full report and fixes it with AI.",
  openGraph: {
    title: "Free Resume Checker: Instant ATS Score and Top Issues | CVEdge",
    description: "Upload your resume and get an ATS score with your top issues. Free, in under 60 seconds.",
    url: "https://www.thecvedge.com/resume-checker",
    images: ["/og-ats-checker.png"],
  },
  alternates: { canonical: "https://www.thecvedge.com/resume-checker" },
};

export default function ResumeCheckerPage() {
  // Only the interactive tool sits behind Suspense. Everything else must render
  // in the initial HTML — with the explainer inside the boundary, SSR emitted
  // the fallback and the page served 68 words of nav and footer to a crawler.
  // The H1 lives here for the same reason.
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Resume Checker", url: "https://www.thecvedge.com/resume-checker" },
        ]}
      />
      <ServiceJsonLd
        name="Free Resume Checker"
        description="Upload a PDF resume or paste its text to check your ATS score. CVEdge analyzes your resume across 6 categories (keywords, formatting, measurable results, bullet quality, sections, and contact info) and shows your top issues free. Pro shows the full report."
        url="https://www.thecvedge.com/resume-checker"
        serviceType="ATS Resume Analysis"
      />
      <div className="container mx-auto max-w-2xl px-4 pt-12 md:pt-20 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" /> ATS score + top issues
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Free resume checker</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Upload your resume to get an ATS score and your top issues. Takes under 60 seconds.
        </p>
      </div>
      <Suspense fallback={<div />}>
        <ResumeCheckerContent />
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
        <h2 className="text-2xl font-bold tracking-tight mb-6">How the resume checker works</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {CHECKER_STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border bg-card p-4">
              <p className="text-xs font-bold text-primary">Step {i + 1}</p>
              <p className="text-sm font-semibold mt-1">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-14">
        <h2 className="text-2xl font-bold tracking-tight mb-4">What the resume checker looks at</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          An applicant tracking system parses your resume into structured fields before anyone reads it: contact block,
          work history, skills, education. Anything that breaks that parse is invisible to you and decisive for your
          application. CVEdge scores your resume across the six categories that determine whether it survives.
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

const CHECKER_STEPS = [
  { title: "Upload your resume", detail: "Drop in a PDF or paste the text. The checker reads it the way an applicant tracking system does." },
  { title: "Sign in free", detail: "Sign in with Google or LinkedIn to see your score and top issues. No card, and your resume is saved in the builder." },
  { title: "Fix what it finds", detail: "Each issue links to the line it's about. Fix it in the editor and watch the estimated score move as you type. Pro re-runs the full check and rewrites bullets with AI." },
];

const ATS_CATEGORIES = [
  { name: "Contact details", detail: "Whether your name, email and phone are extractable. Details placed in a document header are frequently not read at all, which can make you unreachable." },
  { name: "Sections", detail: "Whether standard headings (Experience, Education, Skills) are present and recognized. Content under an unconventional heading may be dropped from the parsed record." },
  { name: "Keywords", detail: "Coverage of the vocabulary used in the roles you are targeting, including where your phrasing differs from the posting's for the same skill." },
  { name: "Measurable results", detail: "How many bullets carry a number. Bullets describing responsibilities rather than outcomes are the most common reason a resume reads as unremarkable." },
  { name: "Bullet quality", detail: "Whether bullets open with a strong action verb and state what changed, rather than starting with \"Responsible for\"." },
  { name: "Formatting", detail: "Tables, text boxes, multi-column layouts, icons and image-based text, the choices that corrupt reading order or extract as nothing." },
];

const SCORE_BANDS = [
  { band: "90+", label: "Interview ready", detail: "Parses cleanly and reads as relevant. Further effort is better spent on the strength of your bullets than on the score." },
  { band: "75–89", label: "Strong profile", detail: "No structural problems. Usually a keyword-alignment gap against the specific roles you are applying to." },
  { band: "60–74", label: "Needs improvement", detail: "Typically a missing skills section, unmeasured bullets, or vocabulary that does not match the postings." },
  { band: "Under 60", label: "At risk", detail: "Usually a parsing failure: contact details in a header, a table-based layout, or text embedded in an image." },
];

const ATS_FAQ = [
  {
    question: "Is the ATS check really free?",
    answer:
      "Yes. Upload a resume or paste its text, sign in with a free account, and you get your ATS score and the top issues found. No card needed. The full report (every issue, missing keywords and suggestions), repeat scans and AI fixes are in Pro.",
  },
  {
    question: "What file formats can I upload?",
    answer:
      "PDF, up to 5 MB, or you can paste the text. If your resume is a Word file, save it as a PDF first or paste its contents. One caveat worth knowing: a PDF exported as an image contains no selectable text, so neither our checker nor a real applicant tracking system can read it. If your resume came out of a design tool, check that you can select the text in it.",
  },
  {
    question: "Can I check my resume against a job description?",
    answer:
      "Yes, with Pro. Open the Match tab in the editor and paste the job posting. Job Match shows which of the posting's keywords your resume covers, which are missing, and the fixes that would raise your match score most.",
  },
  {
    question: "Does a high ATS score guarantee interviews?",
    answer:
      "No, and it is worth being clear about that. The score measures whether your resume is machine-readable and relevant to a target role, so it cannot measure whether your experience is compelling. A 95% score on vague, unmeasured bullets will still lose to a 78% resume that clearly shows someone shipped valuable work. Treat the score as a floor to clear, not a number to maximize.",
  },
  {
    question: "Do you store my CV?",
    answer:
      "Your resume is processed to generate the analysis. If you are signed in, it is saved to your account so you can edit and re-score it. You can delete it at any time. See our privacy policy for the full detail on retention and processing.",
  },
  {
    question: "Why does my CV score differently on other tools?",
    answer:
      "Different checkers weight the categories differently and use different keyword sets, so absolute scores are not comparable between tools. What is comparable is the direction of travel within one tool: fix the issues it names and confirm the categories you targeted actually moved.",
  },
];
