import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";
import { CV_FORMATS } from "@/lib/cv-formats/data";

// The leaf pages' breadcrumb declares a "CV Formats" level. Without this page
// that level pointed at /resume-templates, which is a different thing, and the
// URL /cv-format itself 404'd — a breadcrumb naming a level that does not exist
// is exactly the kind of markup inconsistency Search Console flags.
export const metadata: Metadata = {
  title: "CV Formats by Country and Standard — Free Word Templates",
  description:
    "Free downloadable templates for the named CV formats employers actually ask for: Europass, the German Lebenslauf, the IIM resume format, Gulf CVs and Jake's Resume. Word files, no account needed.",
  alternates: { canonical: "https://www.thecvedge.com/cv-format" },
  openGraph: {
    title: "CV Formats by Country and Standard | CVEdge",
    description:
      "Free Word templates for Europass, the German Lebenslauf, the IIM resume format, Gulf CVs and Jake's Resume.",
    url: "https://www.thecvedge.com/cv-format",
  },
};

// Formats that live on their own routes rather than under /cv-format/[slug],
// because they are language- or market-bound pages rather than registry entries.
const EXTERNAL_FORMATS = [
  {
    href: "/de/lebenslauf-vorlage",
    name: "Lebenslauf Vorlage",
    eyebrow: "Deutschland · tabellarisch",
    blurb:
      "The German tabellarischer Lebenslauf, written in German — antichronologisch, with the personal details block and CEFR language levels.",
  },
  {
    href: "/cv-review/gcc",
    name: "Gulf CV Format",
    eyebrow: "UAE, Saudi Arabia, Qatar",
    blurb:
      "The personal details block Gulf recruiters screen on first — visa status, notice period, nationality and current location.",
  },
];

export default function CvFormatIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "CV Formats", url: "https://www.thecvedge.com/cv-format" },
        ]}
      />

      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              CV Formats
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              The formats employers actually ask for
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Some CV formats are conventions with names — a recruiter asks for a Europass
              CV or a placement cell expects the IIM format, and a generic template will not
              do. Each of these is a free Word file with the structure already set.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-4">
            {CV_FORMATS.map((f) => (
              <div key={f.slug} className="rounded-xl border bg-card p-5 flex flex-col">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                  {f.eyebrow}
                </p>
                <Link
                  href={`/cv-format/${f.slug}`}
                  className="text-base font-semibold hover:text-primary transition-colors"
                >
                  {f.name}
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 flex-1">
                  {f.intro[0].split(". ").slice(0, 2).join(". ")}.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api/templates/${f.docxSlug}/docx`} download>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Word file
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/cv-format/${f.slug}`}>Read the guide</Link>
                  </Button>
                </div>
              </div>
            ))}

            {EXTERNAL_FORMATS.map((f) => (
              <div key={f.href} className="rounded-xl border bg-card p-5 flex flex-col">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                  {f.eyebrow}
                </p>
                <Link
                  href={f.href}
                  className="text-base font-semibold hover:text-primary transition-colors"
                >
                  {f.name}
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 flex-1">
                  {f.blurb}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={f.href}>Read the guide</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-6">
            <h2 className="text-base font-bold mb-2">Not sure which you need?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              If nobody has asked you for a named format, you do not need one. A plain
              single-column CV is the safer default almost everywhere — it parses cleanly and
              never reads as inappropriate.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <Link href="/resume-templates/ats-friendly/harvard-cv">
                  Start with a single-column template
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/upload-resume">Score my current CV</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
