import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { CV_FORMATS, getCvFormat, overleafUrl } from "@/lib/cv-formats/data";

export const revalidate = 86400;

export function generateStaticParams() {
  return CV_FORMATS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const format = getCvFormat(slug);
  if (!format) return {};
  const url = `https://www.thecvedge.com/cv-format/${format.slug}`;
  return {
    // No brand suffix — the root layout applies `template: "%s | CVEdge"`.
    title: format.metaTitle,
    description: format.metaDescription,
    alternates: {
      canonical: url,
      ...(format.languages ? { languages: format.languages } : {}),
    },
    openGraph: {
      title: `${format.metaTitle} | CVEdge`,
      description: format.metaDescription,
      url,
    },
  };
}

export default async function CvFormatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const format = getCvFormat(slug);
  if (!format) notFound();

  const others = CV_FORMATS.filter((f) => f.slug !== format.slug);
  const docxHref = `/api/templates/${format.docxSlug}/docx`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "CV Formats", url: "https://www.thecvedge.com/cv-format" },
          { name: format.name, url: `https://www.thecvedge.com/cv-format/${format.slug}` },
        ]}
      />
      <FaqJsonLd items={format.faqs} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              {format.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              {format.name}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {format.headline}
            </p>
            {format.latex ? (
              <>
                {/* LaTeX-first formats: people arrive wanting the .tex, so it leads. */}
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="h-12 px-8 shadow-md shadow-primary/20" asChild>
                    <a
                      href={overleafUrl(format.latex.path)}
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Overleaf
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                    <a href={format.latex.path} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download .tex
                    </a>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Free · MIT licence · Opens as a new Overleaf project
                </p>
                <Button variant="ghost" className="mt-2 h-11" asChild>
                  <a href={docxHref} download>
                    Prefer Word? Download the .docx
                  </a>
                </Button>
              </>
            ) : (
              <>
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="h-12 px-8 shadow-md shadow-primary/20" asChild>
                    <a href={docxHref} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download the Word file
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                    <Link href="/upload-resume">Score my current CV</Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Free · .docx · No account needed
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── BUILDER PITCH (LaTeX formats only) ── */}
      {format.latex && (
        <section className="pt-12 px-5 lg:px-6">
          <div className="mx-auto max-w-3xl rounded-xl border bg-card p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="text-base font-bold mb-1.5">Rather not edit LaTeX?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {format.latex.builderPitch}
              </p>
            </div>
            <Button variant="outline" className="mt-4 h-11 w-full sm:mt-0 sm:w-auto shrink-0" asChild>
              <Link href={format.buildOnline.href}>Build it online</Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── INTRO ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Used for
          </p>
          <p className="text-sm font-medium mb-8">{format.market}</p>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            {format.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── STRUCTURE ── */}
      <section className="py-16 px-5 lg:px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-8">
            What makes this format different
          </h2>
          <div className="space-y-4">
            {format.sections.map((s) => (
              <div key={s.title} className="rounded-xl border bg-card p-5">
                <p className="text-sm font-semibold mb-1.5">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISTAKES ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">
            Mistakes specific to this format
          </h2>
          <ul className="space-y-3">
            {format.mistakes.map((m) => (
              <li
                key={m}
                className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-error" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── DOWNLOAD ── */}
      <section className="py-16 px-5 lg:px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-6">
            <h2 className="text-base font-bold mb-2">
              {format.latex ? "The Word version" : "Download the template"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              A blank Word document with the structure, headings and spacing already set, and an
              italic prompt under each section explaining what belongs there. Delete the prompts
              before you send it.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                "Single column with standard headings, no tables, text boxes or graphics",
                "Verified to parse cleanly through the same library CVEdge uses to read uploads",
                "Editable in Word, Google Docs or Pages",
                "No account, no card, no watermark",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <a href={docxHref} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download the Word file
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={format.buildOnline.href}>Or {format.buildOnline.label}</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              {format.attribution}
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">
            Questions about the {format.name}
          </h2>
          <div className="space-y-3">
            {format.faqs.map((f) => (
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
      </section>

      {/* ── OTHER FORMATS ── */}
      {others.length > 0 && (
        <section className="bg-muted/30 py-14 px-5 lg:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-lg font-bold tracking-tight mb-6">Other CV formats</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/cv-format/${o.slug}`}
                  className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow"
                >
                  <p className="text-sm font-semibold">{o.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{o.eyebrow}</p>
                </Link>
              ))}
              <Link
                href="/de/lebenslauf-vorlage"
                className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow"
              >
                <p className="text-sm font-semibold">Lebenslauf Vorlage</p>
                <p className="text-xs text-muted-foreground mt-1">Deutschland · tabellarisch</p>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
