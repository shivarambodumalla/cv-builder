"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TemplateThumbnailImage } from "@/components/shared/template-thumbnail";
import type { TemplateName } from "@/lib/resume/types";

export interface ShowcaseItem {
  slug: TemplateName;
  label: string;
  href: string;
}

/**
 * Big template cards in one scrolling row: swipe on phones, previous/next
 * buttons (keyboard reachable, disabled at the ends) from sm up.
 */
export function TemplateShowcase({ items }: { items: ShowcaseItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        // Left edge lines up with the page container; the right edge runs to the screen edge (mr-[calc(50%-50vw)]),
        // so the next card peeks in as a "scroll for more" cue. The parent section clips any overflow.
        className="-ml-4 sm:-ml-6 mr-[calc(50%-50vw)] flex snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 gap-4 sm:gap-5 overflow-x-auto pl-4 sm:pl-6 pr-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t) => (
          <Link
            key={t.slug}
            href={t.href}
            className="group flex w-[240px] sm:w-[280px] lg:w-[300px] shrink-0 snap-start flex-col gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#1E3A5F]"
          >
            <span className="block overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.32)] ring-1 ring-white/10 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-1">
              <TemplateThumbnailImage
                template={t.slug}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 280px, 240px"
                className="aspect-[85/110] w-full object-cover object-top"
              />
            </span>
            <span className="flex items-center justify-between gap-2 px-1">
              <span className="text-base font-semibold">{t.label}</span>
              <span className="text-sm text-white/80 group-hover:text-white">Use template</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 hidden sm:flex items-center gap-3">
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={atStart}
          aria-label="Previous templates"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={atEnd}
          aria-label="Next templates"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
