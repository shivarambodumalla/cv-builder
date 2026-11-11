"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Phone-only bar with the page's one action. It appears once the hero button
 * has scrolled away and hides again from the final call to action down
 * (the footer included), so there is never a second copy of the button in view.
 */
export function StickyScanBar({ heroId, endId }: { heroId: string; endId: string }) {
  const [show, setShow] = useState(false);

  // Measured on scroll (once per frame) rather than with IntersectionObserver: a jump from the
  // footer back to the top moves the final CTA from above the screen to below it without ever
  // intersecting, so an observer never fires and the bar would stay hidden.
  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.getElementById(endId);
    if (!hero || !end) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const heroGone = hero.getBoundingClientRect().bottom < 0;
      const endReached = end.getBoundingClientRect().top < window.innerHeight;
      setShow(heroGone && !endReached);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [heroId, endId]);

  // While the bar is up, keep scrolled-to and focused elements clear of it (WCAG 2.4.11 Focus Not Obscured).
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingBottom = show ? "96px" : "";
    return () => {
      root.style.scrollPaddingBottom = "";
    };
  }, [show]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(35,48,42,0.08)] transition-transform duration-300 motion-reduce:transition-none ${
        show ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Free ATS score</p>
          <p className="text-xs text-muted-foreground">No credit card</p>
        </div>
        <Link
          href="/resume-checker"
          tabIndex={show ? 0 : -1}
          className="inline-flex h-12 shrink-0 items-center rounded-lg bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20"
        >
          Scan my resume free
        </Link>
      </div>
    </div>
  );
}
