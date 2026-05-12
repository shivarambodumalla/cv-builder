"use client";

import { useEffect, useRef } from "react";
import { trackCvReviewSectionView } from "@/lib/analytics/cv-review-events";

export function CvReviewSectionTracker({ section }: { section: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          trackCvReviewSectionView(section);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [section]);

  return <div ref={ref} aria-hidden="true" className="absolute inset-0 pointer-events-none" />;
}
