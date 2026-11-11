"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Star, X } from "lucide-react";
import { ReviewAvatar } from "@/components/shared/review-avatar";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/feedback/reviews";
import type { RatingStats } from "@/lib/feedback/stats";
import { REVIEW_FIELDS, type ReviewField } from "@/lib/feedback/review-fields";

/** Featured card + 3 rows of 3 on the first view; each "show more" adds 3 full rows. */
const FIRST_VIEW = 10;
const PAGE = 9;

const SORTS = {
  newest: "Newest",
  detailed: "Most detailed",
  highest: "Highest rated",
  lowest: "Lowest rated",
} as const;
type Sort = keyof typeof SORTS;

const SORTERS: Record<Sort, (a: Review, b: Review) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  detailed: (a, b) => b.quote.length - a.quote.length || b.createdAt.localeCompare(a.createdAt),
  highest: (a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
  lowest: (a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt),
};

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      <span className="sr-only">Rated {value} out of 5</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(className, n <= Math.round(value) ? "fill-warning text-warning" : "fill-muted text-muted")}
        />
      ))}
    </span>
  );
}

function Byline({ r }: { r: Review }) {
  return (
    <span className="block text-xs text-foreground/70">
      {r.name}
      {r.country && <> &middot; {r.country}</>}
    </span>
  );
}

function FeatureChip({ r }: { r: Review }) {
  return (
    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
      {r.usedFeature}
    </span>
  );
}

function FeaturedReview({ r }: { r: Review }) {
  return (
    <figure className="grid gap-6 rounded-2xl border border-border/60 bg-white p-6 dark:bg-card sm:p-8 lg:grid-cols-[1fr_240px] lg:gap-10">
      <blockquote>
        <Stars value={r.rating} />
        <p className="mt-4 text-lg font-medium leading-snug tracking-tight text-foreground sm:text-[22px]">{r.quote}</p>
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border/50 pt-5 lg:self-center lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
        <ReviewAvatar name={r.name} avatarUrl={r.avatar_url} className="h-12 w-12 text-sm" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{r.role}</span>
          <Byline r={r} />
          <span className="mt-1 block text-xs text-foreground/70">
            {r.usedFeature} &middot; {monthFormat.format(new Date(r.createdAt))}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function ReviewCard({ r, hidden }: { r: Review; hidden: boolean }) {
  return (
    <figure
      // A class, not the hidden attribute: Tailwind's "flex" would override it.
      className={cn(hidden ? "hidden" : "flex", "min-h-[200px] flex-col rounded-2xl border border-border/60 bg-white p-5 dark:bg-card sm:p-6")}
    >
      <div className="flex items-center justify-between gap-3">
        <Stars value={r.rating} className="h-3.5 w-3.5" />
        <time dateTime={r.createdAt} className="text-xs text-foreground/70">
          {monthFormat.format(new Date(r.createdAt))}
        </time>
      </div>
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">{r.quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
        <ReviewAvatar name={r.name} avatarUrl={r.avatar_url} />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground" title={r.role}>{r.role}</span>
          <Byline r={r} />
        </span>
        <FeatureChip r={r} />
      </figcaption>
    </figure>
  );
}

function RatingFilterCard({
  rating,
  active,
  onSelect,
}: {
  rating: RatingStats;
  active: number | null;
  onSelect: (n: number | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 dark:bg-card sm:p-7">
      <div className="flex items-center gap-4">
        <p className="text-6xl font-bold leading-none tracking-tight tabular-nums">{rating.average.toFixed(1)}</p>
        <div>
          <Stars value={rating.average} className="h-5 w-5" />
          <p className="mt-1 text-sm text-foreground/70">from {rating.count} ratings</p>
        </div>
      </div>
      <ul className="mt-6 space-y-1" aria-label="Filter reviews by rating">
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const count = rating.distribution[n];
          const pressed = active === n;
          return (
            <li key={n}>
              <button
                type="button"
                aria-pressed={pressed}
                disabled={count === 0}
                onClick={() => onSelect(pressed ? null : n)}
                className={cn(
                  "flex min-h-[36px] w-full items-center gap-3 rounded-lg px-2 text-sm transition-colors",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "disabled:cursor-default disabled:hover:bg-transparent",
                  pressed && "bg-primary/10 hover:bg-primary/15",
                )}
              >
                <span className={cn("w-12 shrink-0 text-left tabular-nums", pressed ? "font-semibold text-primary" : "text-foreground/80")}>
                  {n} star
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-warning"
                    style={{ width: `${rating.count ? (count / rating.count) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums text-foreground/70">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-foreground/70">Select a rating to filter the reviews below.</p>
    </div>
  );
}

export function ReviewsExplorer({
  intro,
  promises,
  reviews,
  rating,
}: {
  /** Server-rendered hero copy and CTAs (left column). */
  intro: ReactNode;
  /** Server-rendered promise strip between the hero and the list. */
  promises: ReactNode;
  reviews: Review[];
  rating: RatingStats | null;
}) {
  const [stars, setStars] = useState<number | null>(null);
  const [field, setField] = useState<ReviewField | null>(null);
  const [sort, setSort] = useState<Sort>("newest");
  const [shown, setShown] = useState(FIRST_VIEW);

  const fieldCounts = useMemo(() => {
    const counts = new Map<ReviewField, number>();
    for (const r of reviews) counts.set(r.field, (counts.get(r.field) ?? 0) + 1);
    return REVIEW_FIELDS.filter((f) => counts.get(f)).map((f) => [f, counts.get(f)!] as const);
  }, [reviews]);

  const list = useMemo(
    () =>
      reviews
        .filter((r) => (stars === null || r.rating === stars) && (field === null || r.field === field))
        .sort(SORTERS[sort]),
    [reviews, stars, field, sort],
  );

  // Any filter or sort change starts the list over at the first view.
  function update(fn: () => void) {
    fn();
    setShown(FIRST_VIEW);
  }

  const [featured, ...rest] = list;
  const visible = Math.min(shown, list.length);
  const remaining = list.length - visible;
  const filtered = stars !== null || field !== null;

  return (
    <>
      <section className="container mx-auto px-4 pb-12 pt-14 md:pb-16 md:pt-20">
        <div className={cn("mx-auto grid max-w-[1100px] items-start gap-10", rating && "lg:grid-cols-[1fr_400px] lg:gap-16")}>
          <div className="lg:pt-6">{intro}</div>
          {rating && <RatingFilterCard rating={rating} active={stars} onSelect={(n) => update(() => setStars(n))} />}
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[1100px]">{promises}</div>
      </div>

      <section id="reviews" className="container mx-auto scroll-mt-24 px-4 pb-16 pt-12 md:pb-24">
        <div className="mx-auto max-w-[1100px]">
          {reviews.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Find someone in your field</p>
                <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                  {[[null, reviews.length] as const, ...fieldCounts].map(([f, count]) => {
                    const pressed = field === f;
                    return (
                      <button
                        key={f ?? "all"}
                        type="button"
                        aria-pressed={pressed}
                        onClick={() => update(() => setField(f))}
                        className={cn(
                          "inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors sm:min-h-[36px]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          pressed
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white text-foreground hover:border-primary/50 dark:bg-card",
                        )}
                      >
                        {f ?? "All"}
                        <span className={cn("tabular-nums", pressed ? "text-primary-foreground/80" : "text-foreground/60")}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="flex shrink-0 flex-col gap-1.5 text-sm font-medium text-foreground">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => update(() => setSort(e.target.value as Sort))}
                  className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-card sm:h-9"
                >
                  {(Object.keys(SORTS) as Sort[]).map((s) => (
                    <option key={s} value={s}>
                      {SORTS[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-foreground/70" aria-live="polite">
              <span>
                Showing {visible} of {list.length} {list.length === 1 ? "review" : "reviews"}
              </span>
              {stars !== null && (
                <ActiveFilter label={`${stars} star`} onClear={() => update(() => setStars(null))} />
              )}
              {field !== null && <ActiveFilter label={field} onClear={() => update(() => setField(null))} />}
              {filtered && (
                <button
                  type="button"
                  onClick={() => update(() => { setStars(null); setField(null); })}
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {featured && (
            <div className="mt-5 space-y-5">
              <FeaturedReview r={featured} />
              {rest.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {/* Every review stays in the HTML (hidden past the fold) so
                      search engines can read the whole list. */}
                  {rest.map((r, i) => (
                    <ReviewCard key={r.id} r={r} hidden={i + 1 >= visible} />
                  ))}
                </div>
              )}
            </div>
          )}

          {filtered && list.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-semibold text-foreground">No written reviews match these filters yet</p>
              <button
                type="button"
                onClick={() => update(() => { setStars(null); setField(null); })}
                className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
              >
                Show all reviews
              </button>
            </div>
          )}

          {remaining > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="min-h-[44px] rounded-lg border border-border bg-white px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-card"
              >
                Show {Math.min(PAGE, remaining)} more {Math.min(PAGE, remaining) === 1 ? "review" : "reviews"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ActiveFilter({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-xs font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/15"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}
