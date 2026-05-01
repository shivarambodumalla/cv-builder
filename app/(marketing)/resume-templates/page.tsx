import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Download, BarChart3, Target } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd, ServiceJsonLd } from "@/components/shared/structured-data";
import { TEMPLATE_CATEGORIES } from "@/lib/resume-templates/data";
import { TemplateShowcase } from "../resumes/template-showcase";

export const metadata: Metadata = {
  title: "Free Resume Templates — ATS-Friendly & Professional | CVEdge",
  description:
    "24 free ATS-friendly resume templates for every role and industry. Single-column and two-column layouts tested on Greenhouse, Workday, and Lever. Upload your CV and score instantly.",
  alternates: { canonical: "https://www.thecvedge.com/resume-templates" },
  openGraph: {
    title: "Free Resume Templates — ATS-Friendly & Professional | CVEdge",
    description:
      "24 free ATS-friendly resume templates. Upload your CV, get an instant ATS score, fix with AI, and download a polished PDF.",
    url: "https://www.thecvedge.com/resume-templates",
  },
};

const FAQS = [
  {
    question: "Which resume template is best for passing ATS?",
    answer:
      "Single-column templates score highest on ATS systems. CVEdge's Classic, Minimal, Sharp, Classic Serif, and Harvard templates all score 92–97 on our ATS analyser. The key factors are: single column, standard heading names (Experience, Education, Skills), no images or tables in the body, and a parseable font. Two-column templates can also pass ATS with modern systems — run CVEdge's ATS analyser on any template to check your specific score.",
  },
  {
    question: "Are all CVEdge resume templates free?",
    answer:
      "20 out of 24 templates are free. Four Pro-only templates — Executive Pro, Electric Lilac, Executive Sidebar, and Wentworth — require a Pro subscription. All free templates include ATS analysis, AI bullet rewriting, job match scoring, and PDF download. No sign-up required to browse.",
  },
  {
    question: "What is the difference between a CV and a resume?",
    answer:
      "A resume is typically 1–2 pages, tailored to a specific job, and used primarily in the US and Canada. A CV (curriculum vitae) is the standard term used in the UK, Australia, and Europe. CVEdge templates work for both formats. If you're in the UK or Australia, 'CV template' and 'resume template' mean the same thing in practice.",
  },
  {
    question: "Can I change the template after building my resume?",
    answer:
      "Yes — CVEdge lets you switch templates in one click without losing any content. Your experience, skills, and all sections transfer instantly. Test multiple layouts before deciding which to submit.",
  },
  {
    question: "How do I know which template to pick for my industry?",
    answer:
      "Browse by category: Software Engineer, Marketing, Freshers, Experienced, ATS-Friendly, or Creative. Each category page explains which templates work best for that audience. As a general rule: single-column formats (Classic, Sharp, Minimal) are universally safe. Two-column formats (Aurora, Coastal, Slate) work well for creative and tech roles.",
  },
  {
    question: "Do CVEdge templates work with ATS systems like Greenhouse and Workday?",
    answer:
      "Yes. CVEdge templates are tested against Greenhouse, Workday, Lever, iCIMS, Taleo, and SmartRecruiters. Single-column templates pass all major systems. Two-column templates score 88–94 on CVEdge's ATS analyser. The analyser gives you a real-time score as you edit.",
  },
];

const CATEGORIES = TEMPLATE_CATEGORIES.map((c) => ({
  slug: c.slug,
  label: c.label,
  count: c.templates.length,
  intro: c.intro.split(".")[0] + ".",
}));

const WHY_MATTERS = [
  {
    icon: CheckCircle,
    title: "75% of resumes are rejected by ATS before a human sees them",
    desc: "The main cause: columns, tables, images, and non-standard section headings. CVEdge templates eliminate every format risk that triggers ATS rejection.",
  },
  {
    icon: BarChart3,
    title: "Your ATS score tells you what to fix before you apply",
    desc: "Upload your resume and get an instant score across 6 categories: contact info, sections, keywords, measurable results, bullet quality, and formatting.",
  },
  {
    icon: Zap,
    title: "AI rewrites every weak bullet in one pass",
    desc: "Fix All ATS rewrites your entire resume summary and all experience bullets to ATS-optimised standards in a single click.",
  },
  {
    icon: Target,
    title: "See your match score against any job before you apply",
    desc: "Paste a job description to see your keyword match score, missing terms, and skills gaps. Increase your match before you hit submit.",
  },
  {
    icon: Download,
    title: "Download a polished PDF ready to send",
    desc: "Clean, print-ready PDF export with zero CVEdge branding. The PDF that comes out looks exactly like a professionally formatted document.",
  },
];

export default function ResumeTemplatesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Resume Templates", url: "https://www.thecvedge.com/resume-templates" },
        ]}
      />
      <ServiceJsonLd
        name="Free ATS-Friendly Resume Templates"
        description="24 professional resume templates tested on Greenhouse, Workday, and Lever. Upload your CV, get an ATS score, fix with AI, download PDF."
        url="https://www.thecvedge.com/resume-templates"
        serviceType="Resume Builder"
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
              Resume Templates
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              Free Resume Templates —{" "}
              <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">
                ATS-Ready for Every Role
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              24 professional templates. Upload your CV, get an instant ATS score, fix
              weak bullets with AI, and export a polished PDF. All free to start.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium shadow-md shadow-primary/20" asChild>
                <Link href="/upload-resume">Upload my CV — free ATS score</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/login">Start from scratch free</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card · No watermarks · Switch templates any time
            </p>
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CATEGORY ── */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-medium text-center text-muted-foreground mb-6">
              Browse by role
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/resume-templates/${c.slug}`}
                  className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow group"
                >
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {c.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.intro}</p>
                  <p className="text-[10px] text-primary mt-2 font-medium">
                    {c.count} templates
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL TEMPLATES ── */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight">All 24 templates</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Filter by layout type or browse everything. Switch any time without losing your content.
              </p>
            </div>
            <TemplateShowcase />
          </div>
        </div>
      </section>

      {/* ── WHY TEMPLATE CHOICE MATTERS ── */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Why your resume template matters more than you think
              </h2>
              <p className="mt-3 text-muted-foreground">
                Most resumes are rejected before a human sees them. CVEdge fixes that.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_MATTERS.slice(0, 3).map((w) => (
                <div key={w.title} className="rounded-xl border bg-background p-5 space-y-2">
                  <w.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">{w.title}</h3>
                  <p className="text-sm text-muted-foreground">{w.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {WHY_MATTERS.slice(3).map((w) => (
                <div key={w.title} className="rounded-xl border bg-background p-5 space-y-2">
                  <w.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">{w.title}</h3>
                  <p className="text-sm text-muted-foreground">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ATS QUICK EXPLAINER ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-8">
              <h2 className="text-xl font-bold tracking-tight mb-4">
                What makes a resume ATS-friendly?
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-success mb-2">✓ ATS-safe format</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Single-column layout</li>
                    <li>Standard heading names (Experience, Education, Skills)</li>
                    <li>No images or tables in body text</li>
                    <li>Standard font at 10–12pt</li>
                    <li>Dates in recognisable formats (Jan 2023 – Mar 2024)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-error mb-2">✗ Common ATS failures</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Two-column layouts (some ATS systems misparse)</li>
                    <li>Headers/footers with contact info</li>
                    <li>Custom section names (&ldquo;My Career&rdquo;)</li>
                    <li>Tables or text boxes</li>
                    <li>Images, logos, or icons in body</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/ats-friendly-resume">Learn how ATS scoring works</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Frequently asked questions
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
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to build a resume that gets interviews?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Upload your current CV for a free ATS score, or start from scratch. No credit card required.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/upload-resume">Upload & score my CV free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Start from scratch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
