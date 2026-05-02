"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Review {
  id: string;
  status: string;
  target_role: string | null;
}

interface Props {
  reviews: Review[];
}

export function CvReviewDashboardBanner({ reviews }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const now = Date.now();
    reviews
      .filter((r) => r.status === "pending" || r.status === "in_progress")
      .forEach((r) => {
        const ts = localStorage.getItem(`cvEdge_review_banner_dismissed_${r.id}`);
        if (ts && now - parseInt(ts) < 8 * 60 * 60 * 1000) {
          setDismissed((prev) => (prev.includes(r.id) ? prev : [...prev, r.id]));
        }
      });
  }, [reviews]);

  function dismiss(id: string) {
    localStorage.setItem(`cvEdge_review_banner_dismissed_${id}`, String(Date.now()));
    setDismissed((prev) => [...prev, id]);
  }

  const visible = reviews.filter(
    (r) => (r.status === "pending" || r.status === "in_progress") && !dismissed.includes(r.id)
  );
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map((review) => {
        const isPending = review.status === "pending";
        return (
          <div
            key={review.id}
            className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
            style={{
              background: isPending ? "#FEF3C7" : "#EFF6FF",
              borderColor: isPending ? "#F59E0B" : "#2563EB",
            }}
          >
            <span style={{ color: isPending ? "#92400E" : "#1D4ED8" }}>
              {isPending
                ? "Your CV review is awaiting our expert. We'll notify you when it's ready."
                : "Your CV review is in progress. Expert is working on your CV."}
            </span>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <Link
                href={`/cv-review/${review.id}`}
                className="font-semibold text-xs underline"
                style={{ color: isPending ? "#92400E" : "#1D4ED8" }}
              >
                View review
              </Link>
              <button
                onClick={() => dismiss(review.id)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
