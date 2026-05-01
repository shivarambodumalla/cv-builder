import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { CATEGORY_MAP, getAllLeafParams, getLeafData } from "@/lib/resume-templates/data";

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllLeafParams().map(({ category, template }) => ({ category, template }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; template: string }>;
}): Promise<Metadata> {
  const { category: catSlug, template: leafSlug } = await params;
  const leaf = getLeafData(catSlug, leafSlug);
  const cat = CATEGORY_MAP.get(catSlug);
  if (!leaf || !cat) return {};
  const title = `${leaf.displayName} — Free Download | CVEdge`;
  const description = leaf.description.replace(/\n/g, " ").slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `https://www.thecvedge.com/resume-templates/${catSlug}/${leafSlug}` },
    openGraph: {
      title,
      description,
      url: `https://www.thecvedge.com/resume-templates/${catSlug}/${leafSlug}`,
      images: leaf.imgPath ? [leaf.imgPath] : [],
    },
  };
}

export default async function TemplateLeafPage({
  params,
}: {
  params: Promise<{ category: string; template: string }>;
}) {
  const { category: catSlug, template: leafSlug } = await params;
  const cat = CATEGORY_MAP.get(catSlug);
  const leaf = getLeafData(catSlug, leafSlug);
  if (!cat || !leaf) notFound();

  const relatedTemplates = cat.templates.filter((t) => t.leafSlug !== leafSlug).slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Resume Templates", url: "https://www.thecvedge.com/resume-templates" },
          { name: cat.label, url: `https://www.thecvedge.com/resume-templates/${cat.slug}` },
          { name: leaf.displayName, url: `https://www.thecvedge.com/resume-templates/${cat.slug}/${leaf.leafSlug}` },
        ]}
      />
      <FaqJsonLd items={leaf.faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#1E3A5F]/[0.06] blur-3xl" />
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <nav className="text-xs text-muted-foreground mb-5 flex items-center gap-1.5 flex-wrap">
              <Link href="/resume-templates" className="hover:text-primary transition-colors">Resume Templates</Link>
              <span>/</span>
              <Link href={`/resume-templates/${cat.slug}`} className="hover:text-primary transition-colors">{cat.label}</Link>
              <span>/</span>
              <span>{leaf.displayName}</span>
            </nav>
            <div className="grid lg:grid-cols-[300px_1fr] gap-10 items-start">
              {/* Template thumbnail */}
              <div className="rounded-xl border overflow-hidden shadow-sm lg:sticky lg:top-20 self-start">
                {leaf.imgPath ? (
                  <img
                    src={leaf.imgPath}
                    alt={`${leaf.displayName} resume template preview`}
                    title={leaf.displayName}
                    className="w-full object-cover object-top"
                  />
                ) : (
                  <div className="aspect-[1242/1754] bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    Preview
                  </div>
                )}
                <div className="p-3 bg-card border-t space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/login?template=${leaf.templateSlug}`}>Use this template free</Link>
                  </Button>
                  {leaf.tier === "pro" && (
                    <p className="text-center text-xs text-muted-foreground">
                      Pro template —{" "}
                      <Link href="/pricing" className="underline hover:text-foreground">unlock with CVEdge Pro</Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Hero copy */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                    {cat.label}
                  </span>
                  <span
                    className={
                      leaf.tier === "pro"
                        ? "rounded-full px-3 py-1 text-xs font-semibold bg-[#1E3A5F] text-white"
                        : "rounded-full px-3 py-1 text-xs font-semibold bg-[#D1FAE5] text-[#065F46]"
                    }
                  >
                    {leaf.tier === "pro" ? "Pro template" : "Free template"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.025em] leading-[1.15] mb-3">
                  {leaf.displayName}
                </h1>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">{leaf.headline}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="h-12 px-8 shadow-md shadow-primary/20" asChild>
                    <Link href="/upload-resume">Upload my CV — use this template</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                    <Link href={`/login?template=${leaf.templateSlug}`}>Start from scratch</Link>
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No credit card · No watermarks · Switch templates any time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEMPLATE DETAILS ── */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-[1fr_360px] gap-10">
              {/* Main content */}
              <div>
                {/* Description */}
                <h2 className="text-xl font-bold tracking-tight mb-4">About this template</h2>
                <div className="space-y-3 mb-8">
                  {leaf.description.split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                  ))}
                </div>

                {/* Who it's for */}
                <h2 className="text-xl font-bold tracking-tight mb-4">Who is this template for?</h2>
                <ul className="space-y-2 mb-8">
                  {leaf.whoFor.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Inline CTA */}
                <div className="rounded-xl bg-[rgba(6,95,70,0.05)] border border-[rgba(6,95,70,0.10)] p-6 mb-8">
                  <p className="font-semibold text-sm mb-1">Start with this template — free</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upload your existing CV or start from scratch. CVEdge pre-fills your content
                    into the template and gives you an instant ATS score.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild>
                      <Link href="/upload-resume">Upload my CV</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/login?template=${leaf.templateSlug}`}>Start from scratch</Link>
                    </Button>
                  </div>
                </div>

                {/* FAQ */}
                <h2 className="text-xl font-bold tracking-tight mb-4">Questions about this template</h2>
                <div className="space-y-3">
                  {leaf.faqs.map((f) => (
                    <details key={f.q} className="rounded-xl border bg-card p-5 group">
                      <summary className="cursor-pointer list-none font-semibold text-sm flex items-start justify-between gap-3">
                        <span>{f.q}</span>
                        <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Sidebar: features */}
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-5 sticky top-6">
                  <h3 className="text-sm font-semibold mb-3">Template features</h3>
                  <ul className="space-y-2">
                    {leaf.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-4 border-t">
                    <Button className="w-full" asChild>
                      <Link href={`/login?template=${leaf.templateSlug}`}>Use this template free</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED TEMPLATES ── */}
      {relatedTemplates.length > 0 && (
        <section className="bg-muted/30 py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight">More {cat.label.toLowerCase()} templates</h2>
                <Link href={`/resume-templates/${cat.slug}`} className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedTemplates.map((t) => (
                  <Link
                    key={t.leafSlug}
                    href={`/resume-templates/${cat.slug}/${t.leafSlug}`}
                    className="group rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-[1242/1754] bg-muted overflow-hidden">
                      {t.imgPath ? (
                        <img
                          src={t.imgPath}
                          alt={t.displayName}
                          title={t.displayName}
                          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Preview</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold">{t.displayName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.headline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-xl font-bold tracking-tight">
              Build your resume with {leaf.displayName.split(" ")[0]} — free
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your existing CV or start fresh. ATS score included. No credit card required.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/upload-resume">Upload my CV free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/login?template=${leaf.templateSlug}`}>Start from scratch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
