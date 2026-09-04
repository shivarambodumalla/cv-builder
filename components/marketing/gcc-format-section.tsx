import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The free-format half of the Gulf market pages.
 *
 * The /cv-review pages sell a paid review, but the search demand reaching them
 * is overwhelmingly for the format itself — twelve format queries ("cv format
 * uae", "uae resume format", "cv ksa", "gcc ats cv") against one for the review
 * service. This section answers the question people are actually asking, and
 * offers the template as a download, so the page serves the majority intent
 * before it pitches the minority one.
 */
export function GccFormatSection({ market }: { market: "uae" | "saudi-arabia" | "gcc" }) {
  const label =
    market === "uae" ? "UAE" : market === "saudi-arabia" ? "Saudi Arabia" : "the GCC";

  return (
    <section className="py-16 px-5 lg:px-6 bg-muted/30">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
          What a {label} CV needs that a Western one doesn&apos;t
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          A CV that works in London or New York is usually missing the fields Gulf
          recruiters screen on first. The layout barely changes — single column, no
          tables, so it still parses cleanly through the ATS the employer runs. What
          changes is a short personal details block near the top.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              t: "Visa status",
              d: "The first thing many Gulf recruiters look for, because it decides how quickly you can start. Say whether your visa is transferable, or that you need sponsorship.",
            },
            {
              t: "Notice period",
              d: "Expected, and often used to sort the shortlist. “30 days” or “Immediate” is enough.",
            },
            {
              t: "Nationality and current location",
              d: "Regional experience is read as a credential of its own. “Dubai, resident since 2021” says more than a company name can.",
            },
            {
              t: "Languages, with real levels",
              d: "Arabic proficiency is worth stating even if conversational. Give a level rather than “good”.",
            },
            {
              t: "A photo — optional but normal",
              d: "Unremarkable in the Gulf, unusual in the US and UK. If you include one, place it in the document body, never in the page header where parsers cannot read it.",
            },
            {
              t: "Degree attestation",
              d: "Many government and semi-government roles require foreign degrees attested. If yours is, say so; it removes a step from the recruiter's mind.",
            },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border bg-card p-5">
              <p className="text-sm font-semibold mb-1.5">{f.t}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-6">
          <h3 className="text-base font-bold mb-2">Free {label} CV template</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A blank Word document with the personal details block already laid out and a
            prompt under each section explaining what belongs there. Single column and
            ATS-safe. No account, no card.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <a href="/api/templates/gcc/docx" download>
                <Download className="mr-2 h-4 w-4" />
                Download the {label} CV template
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/upload-resume">Score my current CV free</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Prefer to build it online?{" "}
            <Link
              href="/resume-templates/ats-friendly/harvard-cv"
              className="text-primary underline underline-offset-4"
            >
              Start from an ATS-safe template
            </Link>{" "}
            and add the personal details section.
          </p>
        </div>
      </div>
    </section>
  );
}
