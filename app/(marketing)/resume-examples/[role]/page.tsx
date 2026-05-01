import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Target, ArrowRight } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { getRoleExampleData, generateGenericExampleData } from "@/lib/resume-examples/data";

export const revalidate = 86400;

const ROLE_MAP = new Map(ALL_ROLES.map((r) => [r.slug, r]));

export function generateStaticParams() {
  return ALL_ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) return {};
  const title = `${role.label} Resume Example 2026 — Templates & Tips | CVEdge`;
  const description = `${role.label} resume example with ATS keywords, strong bullet point samples, common mistakes to avoid, and free templates. Build your ${role.label.toLowerCase()} resume in minutes.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.thecvedge.com/resume-examples/${role.slug}` },
    openGraph: {
      title: `${role.label} Resume Example 2026 | CVEdge`,
      description,
      url: `https://www.thecvedge.com/resume-examples/${role.slug}`,
    },
  };
}

function buildFaqs(label: string) {
  return [
    {
      question: `What should a ${label} resume include?`,
      answer: `A strong ${label} resume needs: a sharp professional summary (3–4 sentences positioning your specialisation and level), detailed experience bullets with measurable results, a skills section with role-relevant tools and technologies, and education credentials. For ${label} roles specifically, always include relevant certifications, portfolio links if applicable, and keywords from the job description in natural language throughout.`,
    },
    {
      question: `How long should a ${label} resume be?`,
      answer: `1 page for graduates and professionals with under 3 years of experience. 2 pages for 3–15 years of experience. 2–3 pages for senior professionals, executives, or roles with extensive credentials, publications, or certifications. CVEdge auto-formats to the right length based on your content and lets you preview the page count in real time.`,
    },
    {
      question: `What are the most important ATS keywords for ${label} roles?`,
      answer: `ATS keywords for ${label} roles include: role-specific tools and technologies, methodologies, certifications, and skills listed explicitly in the job description. Use CVEdge's Job Match tool — paste any ${label} job description and it identifies which keywords are missing from your resume and which would increase your match score most.`,
    },
    {
      question: `How do I make my ${label} resume ATS-friendly?`,
      answer: `Use a single-column template (Classic, Sharp, or Minimal score 90+ on CVEdge's ATS analyser), standard section headings (Experience, Education, Skills), bullet points starting with strong action verbs, and role-specific keywords in natural language. Upload your resume to CVEdge for a free ATS score — you'll see exactly which category is dragging your score and how to fix it.`,
    },
    {
      question: `How do I write strong bullet points for a ${label} resume?`,
      answer: `Strong bullets follow this formula: [strong action verb] + [what you did or built] + [measurable result]. Example: "Led migration of X, reducing latency by 40% for 2M users." Avoid: "Responsible for X" or "Helped with Y." Every bullet should have a result — use [X] placeholders where you don't have a specific number. CVEdge's AI rewriter converts weak bullets to strong ones automatically.`,
    },
  ];
}

export default async function RoleResumeExamplePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) notFound();

  const data = getRoleExampleData(slug) ?? generateGenericExampleData(role.label);
  const faqs = buildFaqs(role.label);

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Resume Examples", url: "https://www.thecvedge.com/resume-templates" },
          {
            name: `${role.label} Resume Example`,
            url: `https://www.thecvedge.com/resume-examples/${role.slug}`,
          },
        ]}
      />
      <FaqJsonLd items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />

      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center mb-14">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2">
          Resume Example
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {role.label} Resume Example
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Real bullet point examples, ATS keywords, common mistakes, and free templates
          specifically for {role.label.toLowerCase()} roles. Build your resume with CVEdge
          and know your ATS score before you apply.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/upload-resume">Upload my CV — free ATS score</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Build {role.label} resume free</Link>
          </Button>
        </div>
      </div>

      {/* Role advice paragraph */}
      <div className="mx-auto max-w-3xl mb-14">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-bold mb-3">
            Writing a strong {role.label.toLowerCase()} resume
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.advice}</p>
        </div>
      </div>

      {/* Sample bullets */}
      <div className="mx-auto max-w-3xl mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Strong {role.label.toLowerCase()} resume bullet examples
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          These are examples of well-written resume bullets for {role.label.toLowerCase()} roles —
          metric-led, action-verb-first, and specific enough to be credible.
        </p>
        <div className="space-y-3">
          {data.sampleBullets.map((bullet, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border bg-card p-4"
            >
              <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{bullet}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-[rgba(6,95,70,0.04)] border border-[rgba(6,95,70,0.10)] p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Struggling with your own bullets?</span>{" "}
            CVEdge's AI rewriter converts weak bullets like "Responsible for X" into strong,
            metric-led statements in one click. Paste your bullet, pick a mode, and get a
            better version instantly.{" "}
            <Link href="/login" className="underline hover:text-foreground">
              Try it free →
            </Link>
          </p>
        </div>
      </div>

      {/* ATS keywords */}
      <div className="mx-auto max-w-3xl mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          ATS keywords for {role.label.toLowerCase()} resumes
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          These are commonly screened keywords for {role.label.toLowerCase()} roles.
          Include the ones relevant to your experience — naturally integrated in your bullets
          and skills section, not keyword-stuffed.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {data.keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
        <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Get role-specific keywords for your exact job description.</span>{" "}
            CVEdge's Job Match tool compares your resume against any {role.label.toLowerCase()} job description
            and shows which keywords are missing — with one-click add.{" "}
            <Link href="/login" className="underline hover:text-foreground">
              Try it free →
            </Link>
          </p>
        </div>
      </div>

      {/* Common mistakes */}
      <div className="mx-auto max-w-3xl mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Common mistakes on {role.label.toLowerCase()} resumes
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Avoid these and you&apos;re already ahead of most applicants.
        </p>
        <div className="space-y-3">
          {data.commonMistakes.map((mistake, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border bg-card p-4"
            >
              <XCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{mistake}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bullet formula */}
      <div className="mx-auto max-w-3xl mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-6">
          The bullet formula that works for {role.label.toLowerCase()} roles
        </h2>
        <div className="rounded-xl border bg-card p-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Action verb", example: "\"Led\", \"Built\", \"Reduced\", \"Grew\"", desc: "Strong opening that shows agency and ownership." },
              { label: "What you did", example: "\"migration of X\", \"dashboard covering Y\"", desc: "Specific enough to be credible — avoid vague 'improved process'." },
              { label: "Measurable result", example: "\"by 40% for 2M users\", \"saving $420K\"", desc: "The number that makes a recruiter stop scrolling." },
            ].map((part) => (
              <div key={part.label} className="text-center">
                <div className="rounded-lg bg-muted p-2 mb-2">
                  <p className="text-xs font-bold text-foreground">{part.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 italic">{part.example}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{part.desc}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Before (weak)</p>
            <p className="text-sm text-muted-foreground italic mb-3">
              &ldquo;Responsible for improving performance of the platform.&rdquo;
            </p>
            <p className="text-xs font-semibold text-success mb-1">After (strong)</p>
            <p className="text-sm">
              &ldquo;Reduced platform response time by 65% through caching and query optimisation,
              improving reliability for 500K monthly active users.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Resume sections guide */}
      <div className="mx-auto max-w-3xl mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-6">
          What to include in each section of your {role.label.toLowerCase()} resume
        </h2>
        <div className="space-y-4">
          {[
            {
              section: "Professional Summary",
              guidance: `3–4 sentences: your job title + years of experience + 2 core specialisms + what you're looking for. For ${role.label.toLowerCase()} roles, lead with your most relevant strength. Keep it under 80 words. Avoid clichés like 'results-driven' — be specific about what you actually do.`,
            },
            {
              section: "Experience",
              guidance: `Reverse chronological order. 3–5 bullet points per role for the last 3 positions; 1–3 for older roles. Every bullet should have an action verb, what you did, and a measurable result. For ${role.label.toLowerCase()} roles, prioritise bullets that show scale, impact, and technical/functional depth.`,
            },
            {
              section: "Skills",
              guidance: `List role-relevant tools, technologies, methodologies, and certifications. Group into categories where you have 5+ skills (e.g. Languages, Cloud, Frameworks). For ATS, ensure exact keyword matches with the job description — spell tools and technologies exactly as they appear in JDs.`,
            },
            {
              section: "Education",
              guidance: `Degree, institution, year. Add relevant certifications below. For senior professionals (8+ years), education moves below experience and can be a single line. For graduates and early-career professionals, lead with education and include relevant coursework, projects, and academic achievements.`,
            },
          ].map((s) => (
            <div key={s.section} className="rounded-xl border bg-card p-5">
              <p className="text-sm font-semibold mb-2">{s.section}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.guidance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended templates */}
      {data.bestTemplates.length > 0 && (
        <div className="mx-auto max-w-3xl mb-14">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            Best resume templates for {role.label.toLowerCase()} roles
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.bestTemplates.map((t) => (
              <Link
                key={t.leafSlug}
                href={`/resume-templates/${t.categorySlug}/${t.leafSlug}`}
                className="group rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{t.name} template</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.categorySlug.replace(/-/g, " ")} category
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/resume-templates"
              className="text-sm text-primary hover:underline"
            >
              View all 24 templates →
            </Link>
          </div>
        </div>
      )}

      {/* Job match cross-link */}
      <div className="mx-auto max-w-3xl mb-14">
        <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Looking for {role.label.toLowerCase()} jobs?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Browse live {role.label.toLowerCase()} roles and match your resume against
              specific job descriptions before applying.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href={`/jobs/${role.slug}`}>Browse {role.label} jobs</Link>
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl mb-14">
        <h2 className="text-xl font-bold tracking-tight mb-6">
          {role.label} resume questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.question} className="rounded-xl border bg-card p-5 group">
              <summary className="cursor-pointer list-none font-semibold text-sm flex items-start justify-between gap-3">
                <span>{f.question}</span>
                <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Build your {role.label.toLowerCase()} resume — free
        </h2>
        <p className="mt-3 text-muted-foreground">
          Upload your existing CV or start fresh. Get an ATS score in seconds and fix
          every issue before you apply.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/upload-resume">Upload my CV free</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Start from scratch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
