import Link from "next/link";
import { Star } from "lucide-react";
import type { Review } from "@/lib/feedback/reviews";
import { ReviewAvatar } from "@/components/shared/review-avatar";
import { SectionHeader } from "@/components/marketing/section-header";

/**
 * Up to five verified reviews (lib/feedback/verified.ts) and the verified
 * rating. A swipe row on phones, three per row on desktop, closed by a card
 * that links to every review. The rating line must stay visible whenever the
 * page emits AggregateRating, so both come from the same value.
 */
export function HomeReviews({ reviews, rating }: { reviews: Review[]; rating: { average: number; count: number } | null }) {
  if (reviews.length === 0 && !rating) return null;

  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHeader
          eyebrow="Reviews"
          title="What users say"
          sub={
            rating ? (
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#B45309] text-[#B45309]" aria-hidden />
                <span>
                  <strong className="text-foreground">{rating.average.toFixed(1)}</strong> from {rating.count} people who downloaded their resume
                </span>
              </span>
            ) : undefined
          }
          className="mb-6 md:mb-10"
        />

        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reviews.map((r) => (
            <figure key={r.id} className="m-0 flex w-[280px] shrink-0 snap-start flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 md:w-auto">
              <div>
                <div className="flex gap-0.5" role="img" aria-label={`${r.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-[#B45309] text-[#B45309]" : "text-border"}`} aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-3 text-[15px] leading-relaxed">{r.quote}</blockquote>
              </div>
              <figcaption className="flex items-center gap-3">
                <ReviewAvatar name={r.name} avatarUrl={r.avatar_url} className="h-9 w-9 text-[11px]" />
                <span className="min-w-0 text-sm">
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block truncate text-muted-foreground">{r.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
          <Link
            href="/reviews"
            className="flex w-[280px] shrink-0 snap-start flex-col justify-between gap-4 rounded-2xl bg-[#1E3A5F] p-5 text-white md:w-auto"
          >
            <span>
              <span className="block text-lg font-bold">Read all reviews</span>
              <span className="mt-1 block text-sm leading-relaxed text-white/80">See what job seekers say after using CVEdge on their resume.</span>
            </span>
            <span className="inline-flex min-h-11 w-fit items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#1E3A5F]">See reviews</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
