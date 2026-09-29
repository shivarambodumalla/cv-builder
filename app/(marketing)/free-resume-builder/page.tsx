import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, BarChart3, Target, Download, FileText } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/shared/structured-data";
import { getPlanLimits, getTemplateCounts, type TemplateCounts } from "@/lib/billing/plan-config";
import { formatLimit, LIMIT_RESET, summarizeAllowance, type PlanQuotas } from "@/lib/billing/format-limits";

type Quotas = { free: PlanQuotas; pro: PlanQuotas };
const WINDOW_QUOTAS = ["ats_scans", "ai_rewrites", "job_matches", "cover_letters", "pdf_downloads"];

// Template counts come from the catalogue. force-static keeps the page static
// (the admin client's no-store fetch would otherwise make it dynamic); it
// re-reads the counts hourly.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { free } = await getTemplateCounts();
  return {
    title: "Free Resume Builder: Build, Score, and Download in Minutes",
    description: `Free resume builder with ATS scoring, AI bullet rewriting, job match analysis, and PDF download. ${free} free templates. No credit card required.`,
    alternates: { canonical: "https://www.thecvedge.com/free-resume-builder" },
    openGraph: {
      title: "Free Resume Builder: Build, Score & Download | CVEdge",
      description: `Free resume builder with ATS scoring, AI rewriting, and PDF download. ${free} free templates. No credit card required.`,
      url: "https://www.thecvedge.com/free-resume-builder",
    },
  };
}

const faqs = ({ total, free, proLabels }: TemplateCounts, quotas: Quotas) => [
  {
    question: "Is CVEdge's resume builder really free?",
    answer:
      `Yes. The free plan includes ${summarizeAllowance(quotas.free, WINDOW_QUOTAS)}, and access to ${free === total ? `all ${total}` : `all ${free} free`} templates. No credit card required. Pro (unlimited everything${proLabels.length ? ` + ${proLabels.length} Pro templates` : ""}) costs $5/week.`,
  },
  {
    question: "How long does it take to build a resume on CVEdge?",
    answer:
      "If you upload an existing resume, CVEdge parses it in under 60 seconds and pre-fills your content automatically. From there, ATS analysis takes 10 seconds, Fix All ATS rewrites every bullet in under 30 seconds, and PDF download is instant. Total time from upload to finished resume: 8–12 minutes for most users.",
  },
  {
    question: "Does the free resume builder add watermarks to the PDF?",
    answer:
      "No. CVEdge's free plan generates clean, professional PDFs with no CVEdge branding or watermarks. There is no 'remove watermark' upgrade. All plans export clean PDFs.",
  },
  {
    question: "Can I use CVEdge to update an existing resume?",
    answer:
      "Yes. Upload your existing resume (PDF or Word) and CVEdge parses it into the editor. Your content is preserved in the correct sections. You can then choose a new template, improve your ATS score, update your experience, and download a new version. You're not starting from scratch.",
  },
  {
    question: "What file formats does CVEdge accept for upload?",
    answer:
      "CVEdge accepts PDF (.pdf) and Microsoft Word (.docx) files. PDF parsing works for most standard resumes. Word parsing handles all common layouts. If your upload doesn't parse correctly, you can manually enter your content in the editor. The structured form makes this fast.",
  },
  {
    question: "What is the difference between free and Pro on CVEdge?",
    answer:
      `Free plan: ${summarizeAllowance(quotas.free, ["ats_scans", "ai_rewrites", "job_matches", "pdf_downloads"])}, ${free} free templates. Pro plan: unlimited everything, ${proLabels.length ? `${proLabels.length} additional Pro templates (${proLabels.join(", ")}), ` : ""}80+ ATS score guarantee, and priority support. Pro costs $5/week (or $14/month, $120/year).`,
  },
];

const freeFeatures = ({ free }: TemplateCounts) => [
  {
    icon: FileText,
    title: "Upload your existing resume or start from scratch",
    desc: "Upload a PDF or paste your resume text. CVEdge extracts your content automatically or walks you through a structured form. You're editing within 60 seconds.",
  },
  {
    icon: BarChart3,
    title: "Instant ATS score across 6 categories",
    desc: "See exactly where your resume fails ATS screening (contact info, sections, keywords, metrics, bullet quality, and formatting) with specific fixes for each issue.",
  },
  {
    icon: Sparkles,
    title: "AI rewrites every weak bullet in one pass",
    desc: "Fix All ATS rewrites your entire resume's bullets and summary to ATS-optimized standards. Review each change, accept what fits, download when done.",
  },
  {
    icon: Target,
    title: "Job match score for any role",
    desc: "Paste a job description and see your keyword match score with missing terms highlighted. Know your match rate before you apply, not after.",
  },
  {
    icon: Download,
    title: "Clean PDF download, no watermarks, ever",
    desc: "Export your finished resume as a polished, print-ready PDF. No CVEdge branding. Free and Pro export the same PDF.",
  },
  {
    icon: CheckCircle,
    title: `${free} free professional templates`,
    desc: "Choose from Classic, Sharp, Minimal, Executive, Aurora, Coastal, and more. Every free template is ATS-tested. Switch templates any time without losing content.",
  },
];

/** A comparison row whose cells come from the live quotas: "3 / 7 days" vs "Unlimited". */
const quotaRow = (feature: string, key: string, quotas: Quotas) => ({
  feature,
  free: formatLimit(quotas.free[key], LIMIT_RESET[key]),
  pro: formatLimit(quotas.pro[key], LIMIT_RESET[key]),
});

const planCompare = ({ total, free }: TemplateCounts, quotas: Quotas) => [
  quotaRow("Resumes", "cvs", quotas),
  quotaRow("ATS scans", "ats_scans", quotas),
  quotaRow("AI rewrites", "ai_rewrites", quotas),
  quotaRow("Job matches", "job_matches", quotas),
  quotaRow("Cover letters", "cover_letters", quotas),
  quotaRow("PDF downloads", "pdf_downloads", quotas),
  { feature: "Templates", free: free === total ? `All ${total}` : `${free} free`, pro: `All ${total}` },
  { feature: "PDF watermark", free: "None", pro: "None" },
  { feature: "80+ score guarantee", free: "–", pro: "✓" },
  quotaRow("Fix All ATS", "fix_all", quotas),
  quotaRow("CV Tailor for JD", "cv_tailor", quotas),
];

export default async function FreeResumeBuilderPage() {
  const [counts, quotas] = await Promise.all([getTemplateCounts(), getPlanLimits()]);
  const FAQS = faqs(counts, quotas);
  const FREE_FEATURES = freeFeatures(counts);
  const PLAN_COMPARE = planCompare(counts, quotas);
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Free Resume Builder", url: "https://www.thecvedge.com/free-resume-builder" },
        ]}
      />
      <ServiceJsonLd
        name="CVEdge Free Resume Builder"
        description="Free resume builder with ATS scoring, AI rewriting, job match analysis, and PDF download. No credit card required."
        url="https://www.thecvedge.com/free-resume-builder"
        serviceType="Resume Builder"
        price="0"
        priceCurrency="USD"
      />
      <FaqJsonLd items={FAQS} />

      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center mb-14">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2">
          Free Resume Builder
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Build, Score, and Download Your Resume Free
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Upload your existing resume or start from scratch. Get an ATS score in seconds,
          fix every issue with AI, match against any job description, and download a
          polished PDF. No credit card. No watermarks.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/upload-resume">Get my free ATS score</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Start from scratch free</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          No credit card required · Clean PDF export · No watermarks
        </p>
      </div>

      {/* Stats bar */}
      <div className="mx-auto max-w-3xl mb-16">
        <div className="rounded-xl border bg-card p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { stat: "32", label: "Templates" },
            { stat: "6", label: "ATS categories scored" },
            { stat: "0", label: "Watermarks on PDF" },
            { stat: "10 min", label: "Average time to done" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold">{s.stat}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What's included free */}
      <div className="mx-auto max-w-4xl mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything on the free plan
          </h2>
          <p className="mt-3 text-muted-foreground">
            No stripped-down free tier. The tools that matter are all free to start.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-background p-5 space-y-2">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-3xl mb-20">
        <h2 className="text-xl font-bold tracking-tight text-center mb-8">
          From upload to finished resume in 10 minutes
        </h2>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Upload your resume or start fresh",
              desc: "Upload a PDF or Word file. CVEdge parses it into a structured editor in under 60 seconds. Or use the form to enter your experience section by section.",
            },
            {
              step: "2",
              title: "Check your ATS score",
              desc: "CVEdge scores your resume across 6 categories instantly. You see specific issues in each category (a keyword gap, a weak bullet, a missing section) with one-click fixes.",
            },
            {
              step: "3",
              title: "Fix everything with Fix All ATS",
              desc: "One click rewrites your entire resume's bullets and summary to ATS-optimized standards. Review each change, accept what fits your voice, and move on.",
            },
            {
              step: "4",
              title: "Match against the specific job",
              desc: "Paste the job description to see your keyword match score. CVEdge highlights missing terms and skills. Fix them in the editor and watch your match score rise.",
            },
            {
              step: "5",
              title: "Download your clean PDF",
              desc: "Export as a polished, print-ready PDF. No watermarks. The file you download is the file you send to employers.",
            },
          ].map((s) => (
            <div key={s.title} className="flex gap-4 rounded-xl border bg-card p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Not-ready-to-sign-up escape hatch. The templates cluster is where most
          organic search lands, and the head-term visitor often wants a file
          rather than an editor — sending them there beats losing the visit. */}
      <div className="mx-auto max-w-3xl mb-20">
        <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-6">
          <h2 className="text-base font-bold mb-2">Just want a blank template?</h2>
          <p className="text-sm text-muted-foreground">
            The{" "}
            <Link
              href="/resume-templates/ats-friendly/harvard-cv"
              className="text-primary underline underline-offset-4"
            >
              free Harvard resume template
            </Link>{" "}
            downloads as a blank Word document with the structure and spacing already set. No
            account, no card. Fill it in offline, then upload it here for a free ATS score when
            you are ready.
          </p>
        </div>
      </div>

      {/* Free vs Pro comparison */}
      <div className="mx-auto max-w-2xl mb-20">
        <h2 className="text-xl font-bold tracking-tight text-center mb-6">
          Free vs Pro: what&apos;s the difference?
        </h2>
        <div className="rounded-xl border overflow-hidden">
          <div className="grid grid-cols-3 bg-muted text-xs font-semibold uppercase tracking-wide">
            <div className="p-3 text-muted-foreground">Feature</div>
            <div className="p-3 border-l text-center">Free</div>
            <div className="p-3 border-l text-center text-primary">Pro</div>
          </div>
          {PLAN_COMPARE.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 text-sm border-t">
              <div className="p-3 text-muted-foreground font-medium">{row.feature}</div>
              <div className="p-3 border-l text-center">{row.free}</div>
              <div className="p-3 border-l text-center font-medium text-primary">{row.pro}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild>
            <Link href="/pricing">See Pro pricing</Link>
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl mb-16">
        <h2 className="text-xl font-bold tracking-tight mb-6">
          Free resume builder questions
        </h2>
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

      {/* CTA */}
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Build your resume for free, right now
        </h2>
        <p className="mt-3 text-muted-foreground">
          No watermarks and no credit card. Upload your resume or start
          fresh and be done in under 10 minutes.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/upload-resume">Get my free ATS score</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Start from scratch free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
