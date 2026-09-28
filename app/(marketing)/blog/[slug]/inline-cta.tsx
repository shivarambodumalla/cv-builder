import Link from "next/link";
import { ArrowRight, FileSearch, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InlineCta as InlineCtaContent } from "@/lib/blog/inline-cta";

/**
 * Quiet mid-article prompt. Deliberately lighter than the green end-of-post
 * CtaSection so it reads as part of the article rather than an interruption;
 * the 2px top line is the same teal accent the editor's active tab uses.
 * `not-prose` keeps the article's typography rules off it.
 */
export function InlineCta({ cta }: { cta: InlineCtaContent }) {
  const Icon = cta.kind === "mentorship" ? GraduationCap : FileSearch;

  return (
    <aside
      aria-label={cta.eyebrow}
      data-track-placement="inline-cta"
      className="not-prose relative my-10 overflow-hidden rounded-2xl border bg-card p-5 sm:p-6 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {cta.eyebrow}
          </p>
          <p className="text-base font-semibold leading-snug text-foreground text-balance">
            {cta.heading}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{cta.body}</p>
        </div>
        <Button asChild className="w-full shrink-0 gap-1.5 sm:w-auto">
          <Link href={cta.href}>
            {cta.buttonText}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
