"use client";

import { useEffect } from "react";
import {
  trackCvReviewFunnelView,
  trackCvReviewFunnelClick,
} from "@/lib/analytics/cv-review-events";

export function CvReviewPageTracker() {
  useEffect(() => {
    trackCvReviewFunnelView();
  }, []);
  return null;
}

export function CvReviewCtaTracker({ ctaName, children }: { ctaName: string; children: React.ReactNode }) {
  return (
    <span onClick={() => trackCvReviewFunnelClick(ctaName)} className="contents">
      {children}
    </span>
  );
}
