import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { TEMPLATE_CATEGORIES, CATEGORY_MAP } from "@/lib/resume-templates/data";

export const revalidate = 86400;

export function generateStaticParams() {
  return TEMPLATE_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = CATEGORY_MAP.get(slug);
  if (!cat) return {};
  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    alternates: { canonical: `https://www.thecvedge.com/resume-templates/${cat.slug}` },
    openGraph: {
      title: cat.metaTitle,
      description: cat.metaDescription,
      url: `https://www.thecvedge.com/resume-templates/${cat.slug}`,
    },
  };
}

export default async function TemplateCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = CATEGORY_MAP.get(slug);
  if (!cat) notFound();

  const faqs = [
    {
      question: `What is the best resume template for ${cat.label.toLowerCase()} roles?`,
      answer: `The best template depends on company type and role level. For most ${cat.label.toLowerCase()} positions, single-column formats (Classic, Sharp, Minimal) maximise ATS safety. For roles at creative or design-forward companies, two-column formats like Aurora or Coastal are appropriate. Use CVEdge's ATS analyser to verify your specific score.`,
    },
    {
      question: `How do I tailor my resume for ${cat.label.toLowerCase()} jobs?`,
      answer: `Paste the job description into CVEdge's Job Match tool. It compares your resume against the JD and highlights missing keywords, skills gaps, and ATS score for that specific role. The Match score shows exactly how aligned your current resume is — and which fixes would increase it most.`,
    },
    {
      question: `Do these templates work for ${cat.label.toLowerCase()} jobs at large companies?`,
      answer: `Yes. Every template on this page is tested against major ATS systems used by large employers — Greenhouse, Workday, Lever, and iCIMS. Single-column templates score 90–97 on CVEdge's ATS analyser. Two-column templates score 85–93. Run your resume through the analyser before applying via any portal.`,
    },
    {
      question: "Can I switch templates after building my resume?",
      answer:
        "Yes — CVEdge lets you switch templates in one click. Your content (experience, skills, education) transfers instantly. Preview your resume in multiple layouts before deciding which to submit.",
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Resume Templates", url: "https://www.thecvedge.com/resume-templates" },
          { name: cat.label, url: `https://www.thecvedge.com/resume-templates/${cat.slug}` },
        ]}
      />
      <FaqJsonLd items={faqs} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-secondary/[0.06] blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <nav className="text-xs text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
              <Link href="/resume-templates" className="hover:text-primary transition-colors">Resume Templates</Link>
              <span>/</span>
              <span>{cat.label}</span>
            </nav>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              {cat.label} Templates
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              {cat.h1.includes("Resume") ? (
                <>
                  {cat.h1.replace(" Resume Templates", "")}{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Resume Templates
                  </span>
                </>
              ) : (
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {cat.h1}
                </span>
              )}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {cat.intro}
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
              {cat.templates.length} templates · All free to try · Switch any time
            </p>
          </div>
        </div>
      </section>

      {/* ── TEMPLATE GRID ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-bold tracking-tight mb-6 text-center">
              {cat.templates.length} templates for {cat.label.toLowerCase()} roles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cat.templates.map((t) => (
                <Link
                  key={t.leafSlug}
                  href={`/resume-templates/${cat.slug}/${t.leafSlug}`}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[1242/1754] bg-muted overflow-hidden relative">
                    {t.imgPath ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.imgPath}
                          alt={`${t.displayName} preview`}
                          title={t.displayName}
                          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                        Preview
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{t.displayName}</h3>
                      <span
                        className={
                          t.tier === "pro"
                            ? "rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-secondary text-white"
                            : "rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary"
                        }
                      >
                        {t.tier === "pro" ? "Pro" : "Free"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.headline}</p>
                    <span className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white group-hover:bg-primary/90 transition-colors">
                      View template
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY THESE TEMPLATES WORK ── */}
      <section className="bg-muted/30 py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-4">
              What makes a strong {cat.label.toLowerCase()} resume?
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed mb-8">
              {cat.intro.split(". ").filter(Boolean).map((sentence, i) => (
                <p key={i}>{sentence}.</p>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-5">
                <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  ATS score before you apply
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload your resume and get an instant score across 6 categories. Fix
                  issues one by one before submitting to any application portal.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Job match score for every application
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paste a job description and see your match score instantly. CVEdge
                  highlights missing keywords so you can fix them before you apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
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

      {/* ── CROSS-LINKS ── */}
      <section className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-muted-foreground mb-4">Browse other template categories</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/resume-templates/${c.slug}`}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                >
                  {c.label} templates
                </Link>
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
              Start with any template — switch any time
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your CV for a free ATS score or start from scratch. All templates free to try.
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
