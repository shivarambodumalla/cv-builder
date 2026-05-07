import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { TemplateShowcase } from "../resumes/template-showcase";

export const metadata: Metadata = {
  title: "Free CV Templates — ATS-Friendly for UK & Australia | CVEdge",
  description:
    "Free CV templates for UK, Australian, and international job applications. ATS-safe formats with instant score, AI rewriting, and clean PDF download. No sign-up required.",
  alternates: { canonical: "https://www.thecvedge.com/cv-templates" },
  openGraph: {
    title: "Free CV Templates — ATS-Friendly for UK & Australia | CVEdge",
    description:
      "Free CV templates tested on UK and Australian ATS systems. Upload your CV, get an instant score, fix with AI, and download a polished PDF.",
    url: "https://www.thecvedge.com/cv-templates",
  },
};

const FAQS = [
  {
    question: "What is the difference between a CV and a resume?",
    answer:
      "In the UK, Australia, and most of Europe, 'CV' (curriculum vitae) is the standard term for the document you send to employers — regardless of length. In the US and Canada, 'resume' is used for a 1–2 page tailored document, while 'CV' is reserved for longer academic documents. For practical purposes, CVEdge templates work for both. If you're in the UK or Australia, 'CV template' and 'resume template' mean the same thing.",
  },
  {
    question: "Are these CV templates suitable for UK job applications?",
    answer:
      "Yes — CVEdge templates are designed for UK, Australian, and international job applications. The formats follow standard UK CV conventions: clear contact section, reverse-chronological work history, education with grades, and optional personal profile. UK ATS systems (including those used by NHS, civil service, and major employers) are fully supported.",
  },
  {
    question: "Should I include a photo on my UK CV?",
    answer:
      "In the UK, a photo is optional and not universally expected. Many recruiters and employers are neutral on it. CVEdge lets you add or remove a photo on any template. For international applications or creative industries, a professional photo is more common and acceptable.",
  },
  {
    question: "How long should a CV be for UK job applications?",
    answer:
      "UK CV standard: 2 pages maximum for most roles; 1 page for graduates and entry-level; up to 3 pages for senior executives with extensive credentials. CVEdge auto-formats to the appropriate length based on your content, with real-time page count preview.",
  },
  {
    question: "Do CVEdge CV templates work with UK ATS systems?",
    answer:
      "Yes. CVEdge single-column templates are tested against ATS systems widely used by UK employers including Workday, Taleo, and SmartRecruiters. UK public sector and NHS applications may have specific formatting requirements — always check the job listing's guidance before submitting.",
  },
  {
    question: "What should I include in a UK CV personal profile?",
    answer:
      "A UK CV personal profile is 3–4 sentences: your job title/specialism, years of experience, key strengths, and what you're looking for. Keep it under 80 words. Avoid clichés like 'results-driven professional' — be specific. CVEdge's AI can write your summary from your existing experience if you're stuck.",
  },
];

const CV_VS_RESUME = [
  { label: "Term used", uk: "CV", us: "Resume" },
  { label: "Typical length", uk: "1–2 pages", us: "1 page (2 for senior)" },
  { label: "Photo", uk: "Optional", us: "Not recommended" },
  { label: "Personal profile", uk: "Common (3–4 sentences)", us: "Optional summary" },
  { label: "Hobbies / interests", uk: "Common at bottom", us: "Rare" },
];

const TEMPLATE_TIPS = [
  {
    title: "Single-column CVs score highest on UK ATS",
    desc: "Classic, Sharp, Minimal, Classic Serif, and Harvard all score 90+ on CVEdge's ATS analyser — ideal for UK portal applications.",
  },
  {
    title: "Two-column CVs work for direct applications",
    desc: "Aurora, Slate, Coastal, and Orchid work well when sending directly to a recruiter or applying without automated portal screening.",
  },
  {
    title: "Include a personal profile on your UK CV",
    desc: "UK employers expect a 3–4 sentence profile at the top of your CV. CVEdge's AI can generate one from your experience in 20 seconds.",
  },
];

export default function CvTemplatesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "CV Templates", url: "https://www.thecvedge.com/cv-templates" },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-secondary/[0.06] blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              CV Templates — UK & Australia
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              Free CV Templates —{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ATS-Ready for UK & Australia
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              24 professional CV templates for UK, Australian, and international job
              applications. Upload your existing CV for a free ATS score, or start fresh.
              No credit card required.
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
              No credit card · No watermarks · ATS-tested for UK employers
            </p>
          </div>
        </div>
      </section>

      {/* ── CV VS RESUME ── */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-lg font-bold tracking-tight text-center mb-6">
              CV or resume? Quick reference for UK applicants
            </h2>
            <div className="rounded-xl border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted text-xs font-semibold uppercase tracking-wide">
                <div className="p-3 text-muted-foreground">Field</div>
                <div className="p-3 border-l">UK / Australia</div>
                <div className="p-3 border-l">USA / Canada</div>
              </div>
              {CV_VS_RESUME.map((row) => (
                <div key={row.label} className="grid grid-cols-3 text-sm border-t">
                  <div className="p-3 text-muted-foreground font-medium">{row.label}</div>
                  <div className="p-3 border-l">{row.uk}</div>
                  <div className="p-3 border-l text-muted-foreground">{row.us}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              CVEdge templates work for all markets. Switch format and language in the designer panel.
            </p>
          </div>
        </div>
      </section>

      {/* ── ALL TEMPLATES ── */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">All 24 CV templates</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Switch templates any time — your content transfers in one click.
              </p>
            </div>
            <TemplateShowcase />
          </div>
        </div>
      </section>

      {/* ── TIPS ── */}
      <section className="bg-muted/30 py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-6">Tips for choosing the right CV template</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {TEMPLATE_TIPS.map((tip) => (
                <div key={tip.title} className="rounded-xl border bg-card p-5 space-y-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{tip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CROSS-LINK ── */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border bg-[rgba(255,94,89,0.04)] border-[rgba(255,94,89,0.10)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Looking for role-specific CV templates?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse templates by role: Software Engineer, Marketing, Freshers, Experienced, ATS-Friendly, Creative.
                </p>
              </div>
              <Button variant="outline" asChild className="shrink-0">
                <Link href="/resume-templates">Browse by role</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/30 py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-6">CV template questions</h2>
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
            <h2 className="text-xl font-bold tracking-tight">
              Build a CV that passes ATS and impresses hiring managers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free to start. No credit card. Upload your existing CV or start fresh in under 5 minutes.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/upload-resume">Upload my CV free</Link>
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
