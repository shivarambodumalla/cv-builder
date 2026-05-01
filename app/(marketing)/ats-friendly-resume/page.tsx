import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, BarChart3, Zap, Target } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/shared/structured-data";

export const metadata: Metadata = {
  title: "ATS-Friendly Resume Builder — Score 80+ Before You Apply | CVEdge",
  description:
    "Build an ATS-friendly resume that passes Greenhouse, Workday, and Lever automatically. Get an instant ATS score across 6 categories, fix issues with AI, and download a polished PDF.",
  alternates: { canonical: "https://www.thecvedge.com/ats-friendly-resume" },
  openGraph: {
    title: "ATS-Friendly Resume Builder — Score 80+ Before You Apply | CVEdge",
    description:
      "75% of resumes are rejected by ATS before a human sees them. CVEdge gives you an instant score and fixes every issue before you apply.",
    url: "https://www.thecvedge.com/ats-friendly-resume",
  },
};

const FAQS = [
  {
    question: "What does ATS-friendly mean for a resume?",
    answer:
      "An ATS-friendly resume is formatted and written so that applicant tracking software can correctly parse and score it. Key requirements: single-column layout (no tables or text boxes), standard section heading names (Experience, Education, Skills), no images or graphics in the body, a standard font at 10–12pt, and contact information in the main body (not in headers/footers). Content must also include role-relevant keywords that match the job description.",
  },
  {
    question: "Which ATS systems does CVEdge test against?",
    answer:
      "CVEdge's ATS analyser models the parsing behaviour of Greenhouse, Workday, Lever, iCIMS, Taleo, and SmartRecruiters — the six systems that collectively handle over 80% of corporate job applications. Single-column CVEdge templates score 90–97 on the analyser for well-formatted content.",
  },
  {
    question: "What is a good ATS score?",
    answer:
      "CVEdge scores resumes 0–100 across 6 categories. A score of 75+ is 'Strong Profile'. 90+ is 'Interview Ready'. Below 60 is 'At Risk' — format or content issues are likely causing ATS rejection. The average unoptimised resume scores 52 on CVEdge's analyser. After using Fix All ATS, average improvement is 24 points.",
  },
  {
    question: "Do two-column resume templates pass ATS?",
    answer:
      "Some do, some don't. Modern ATS systems (Greenhouse, Lever) handle well-structured two-column layouts. Older systems (Taleo, some Workday versions) can misparse two-column layouts, scrambling your experience into the wrong fields. CVEdge's ATS analyser scores each template and content combination individually — always check before submitting.",
  },
  {
    question: "What are the most common reasons resumes fail ATS?",
    answer:
      "1. Two-column layouts or tables that scramble during parsing. 2. Non-standard section heading names ('My Career' instead of 'Experience'). 3. Missing keywords from the job description — ATS scores keyword match explicitly. 4. Contact info in headers/footers (parsed separately from body text). 5. Images or graphics that prevent text parsing. 6. Weak or vague bullet points that don't contain relevant action verbs or results.",
  },
  {
    question: "How does CVEdge's Fix All ATS feature work?",
    answer:
      "Fix All ATS sends your entire resume to CVEdge's AI, which rewrites your professional summary and all experience bullets to ATS-optimised standards in a single pass. It uses strong action verbs, adds measurable results with placeholders where data is missing, removes passive language, and ensures keywords are naturally integrated. Average ATS score improvement after Fix All: 24 points. You review every change before applying.",
  },
];

const ATS_CATEGORIES = [
  {
    name: "Contact Information",
    desc: "Name, email, phone, location, and LinkedIn correctly placed in the main body — not in a header or footer that ATS systems skip.",
    tips: ["Email must be professional", "Phone format consistent", "LinkedIn URL clean"],
  },
  {
    name: "Sections & Structure",
    desc: "Standard section headings (Experience, Education, Skills) that every ATS parser expects. Missing sections or unusual names cause misclassification.",
    tips: ["Use 'Experience' not 'Work History'", "Include a Skills section", "Summary optional but recommended"],
  },
  {
    name: "Keywords",
    desc: "Role-relevant keywords from the job description appear in your resume. ATS scores keyword match explicitly — missing keywords lower your score regardless of experience.",
    tips: ["Use exact phrases from JD", "Add tools, certifications, methodologies", "Integrate naturally — don't keyword-stuff"],
  },
  {
    name: "Measurable Results",
    desc: "Bullets include quantified outcomes (%, £/$, users, time saved). Metric-led bullets score higher on ATS and with human reviewers.",
    tips: ["Every bullet ideally has a number", "Use [X] placeholders if unsure", "Include scale: team size, user count, budget"],
  },
  {
    name: "Bullet Quality",
    desc: "Bullets start with strong action verbs (Led, Built, Reduced, Grew) and describe impact rather than responsibility. 'Responsible for X' fails; 'Built X that achieved Y' passes.",
    tips: ["Strong opening verb required", "No passive language", "Focus on outcome not activity"],
  },
  {
    name: "Formatting",
    desc: "Single-column layout, standard font (10–12pt), no tables/images in body, dates in consistent format, and appropriate length (1–2 pages).",
    tips: ["Single column for maximum safety", "Dates: 'Jan 2022 – Mar 2024'", "No images, logos, or graphics"],
  },
];

const SCORE_THRESHOLDS = [
  { range: "90–100", label: "Interview Ready", colour: "text-success", desc: "Format and content optimised. Passes all major ATS systems." },
  { range: "75–89", label: "Strong Profile", colour: "text-success", desc: "Minor improvements available. Will pass most ATS systems." },
  { range: "60–74", label: "Needs Improvement", colour: "text-warning", desc: "Format or content issues likely causing lower match rates." },
  { range: "Below 60", label: "At Risk", colour: "text-error", desc: "Significant issues. ATS rejection risk is high without fixes." },
];

export default function AtsFriendlyResumePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "ATS-Friendly Resume", url: "https://www.thecvedge.com/ats-friendly-resume" },
        ]}
      />
      <ServiceJsonLd
        name="ATS Resume Score & Fixer"
        description="Instant ATS score across 6 categories. AI-powered rewriting to fix every issue before you apply."
        url="https://www.thecvedge.com/ats-friendly-resume"
        serviceType="ATS Resume Optimiser"
        price="0"
        priceCurrency="USD"
      />
      <FaqJsonLd items={FAQS} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#1E3A5F]/[0.06] blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              ATS Resume Builder
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              Build an ATS-Friendly Resume —{" "}
              <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">
                Score 80+ Before You Apply
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              75% of resumes are rejected by ATS before a recruiter sees them. CVEdge gives
              you an instant score across 6 categories and fixes every issue with AI — in
              minutes, not hours.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium shadow-md shadow-primary/20" asChild>
                <Link href="/upload-resume">Upload my CV — free ATS score</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/login">Build ATS resume from scratch</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Tested on Greenhouse, Workday & Lever · No credit card · Avg improvement +18 pts
            </p>
          </div>
        </div>
      </section>

      {/* ── SCORE THRESHOLDS ── */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-lg font-bold tracking-tight text-center mb-6">What your ATS score means</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SCORE_THRESHOLDS.map((s) => (
                <div key={s.range} className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-lg font-bold">{s.range}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${s.colour}`}>{s.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 CATEGORIES ── */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The 6 categories CVEdge scores</h2>
              <p className="mt-3 text-muted-foreground">
                Every CVEdge ATS report breaks down exactly which category is dragging your score — and what to fix.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ATS_CATEGORIES.map((cat, i) => (
                <div key={cat.name} className="rounded-xl border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-sm">{cat.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                  <ul className="space-y-1">
                    {cat.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFE VS RISKY ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-6 text-center">ATS-safe vs ATS-risky formatting</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-success flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4" /> ATS-safe
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Single-column layout", "Standard heading names (Experience, Education, Skills)", "Contact info in main body — not header/footer", "Standard fonts at 10–12pt", "Dates in consistent format (Jan 2022 – Mar 2024)", "PDF with text layer (not scanned image)"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-error flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4" /> ATS-risky
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Two-column layouts (some ATS systems misparse)", "Tables or text boxes for experience", "Images, logos, or icons in the body", "Contact info only in header/footer", "Unusual section names ('My Journey')", "Scanned PDF with no text layer"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <XCircle className="h-3.5 w-3.5 text-error shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW CVEDGE WORKS ── */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight text-center mb-8">How CVEdge gets you to 80+</h2>
            <div className="space-y-4">
              {[
                { icon: BarChart3, step: "1", title: "Upload your CV and get an instant score", desc: "CVEdge analyses your resume across all 6 ATS categories in seconds. You see exactly which category is dragging your score — and specific issues within each one." },
                { icon: Zap, step: "2", title: "Fix everything with AI in one pass", desc: "Fix All ATS rewrites your summary and all experience bullets to ATS-optimised standards simultaneously. Review every change, accept what you like, and adjust what doesn't fit your voice." },
                { icon: Target, step: "3", title: "Match your score to the specific job", desc: "Paste the job description to see your keyword match score. CVEdge shows which missing terms would increase your match the most — add them in two clicks." },
              ].map((step) => (
                <div key={step.title} className="flex gap-4 rounded-xl border bg-card p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{step.step}</div>
                  <div>
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEMPLATE LINKS ── */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-6">
              <h2 className="text-base font-bold mb-2">Browse ATS-safe templates</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Every template on CVEdge is tested for ATS compatibility. Single-column formats score 90–97.
                Two-column formats score 85–93.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm"><Link href="/resume-templates/ats-friendly">ATS-friendly templates</Link></Button>
                <Button variant="outline" size="sm" asChild><Link href="/resume-templates">All templates</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/30 py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-6">ATS resume questions answered</h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
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
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">Stop getting filtered before a human sees you</h2>
            <p className="mt-3 text-muted-foreground">
              Upload your CV now for a free ATS score. Understand exactly what to fix — then fix it with AI.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/upload-resume">Get my free ATS score</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
