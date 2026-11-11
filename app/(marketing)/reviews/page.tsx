import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, PenLine, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/shared/cta-section";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";
import { ReviewsExplorer } from "@/components/reviews/reviews-explorer";
import { getPublicRatingStats, MIN_PUBLIC_RATINGS } from "@/lib/feedback/stats";
import { getPublishedReviews, hasPublicReviews } from "@/lib/feedback/reviews";

// Reviews, ratings and counts come from the DB. force-static keeps the page
// static (the admin client's no-store fetch would otherwise make it dynamic);
// it re-reads them hourly.
export const dynamic = "force-static";
export const revalidate = 3600;

const URL = "https://www.thecvedge.com/reviews";
const DESCRIPTION =
  "Reviews and ratings from people who built and downloaded their resume with CVEdge. Every review is written by a real user and shown as they wrote it.";

// An empty reviews page is thin content, so it stays out of the index (and
// the sitemap, see app/sitemap.ts) until it has something to show.
export async function generateMetadata(): Promise<Metadata> {
  const hasContent = await hasPublicReviews();
  return {
    title: "Reviews: What Users Say",
    description: DESCRIPTION,
    alternates: { canonical: URL },
    robots: hasContent ? undefined : { index: false, follow: true },
    openGraph: { title: "CVEdge Reviews: What Users Say", description: DESCRIPTION, url: URL },
    twitter: { title: "CVEdge Reviews: What Users Say", description: DESCRIPTION },
  };
}

const PROMISES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserRound,
    title: "Only from real users",
    text: "We ask for a rating after someone downloads their resume, in the app or by email the next day.",
  },
  {
    icon: PenLine,
    title: "Never written by us",
    text: "Reviews appear as their authors wrote them, and only if they said we could share them.",
  },
  {
    icon: BarChart3,
    title: "A real average",
    text: `The score counts every rating, including the low ones, and shows once ${MIN_PUBLIC_RATINGS} people have rated us.`,
  },
];

export default async function ReviewsPage() {
  const [reviews, rating] = await Promise.all([getPublishedReviews(), getPublicRatingStats()]);
  const empty = reviews.length === 0 && rating === null;

  // AggregateRating only when the same rating is visible on the page.
  const jsonLd = rating
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "CVEdge",
        url: "https://www.thecvedge.com",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        aggregateRating: { "@type": "AggregateRating", ratingValue: String(rating.average), ratingCount: String(rating.count), bestRating: "5", worstRating: "1" },
      }
    : null;

  const intro = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">Reviews</p>
      <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[56px]">
        What users say about CVEdge
      </h1>
      <p className="mt-5 max-w-[480px] text-base leading-relaxed text-foreground/80 sm:text-lg">
        Reviews from people who scanned or built a resume here, published as they wrote them. The critical ones stay up too.
      </p>
      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Button asChild size="lg" className="h-12 px-6">
          <Link href="/resume-checker">Scan your resume free</Link>
        </Button>
        {reviews.length > 0 && (
          <Link href="#reviews" className="text-sm font-semibold text-primary underline underline-offset-4">
            Read the reviews
          </Link>
        )}
      </div>
    </>
  );

  const promises = (
    <ul className="grid gap-6 border-y border-border/70 py-7 sm:grid-cols-3 sm:gap-8">
      {PROMISES.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold text-foreground">{title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-foreground/70">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Reviews", url: URL },
        ]}
      />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <div className="bg-[#f5f0e8] dark:bg-background">
        <ReviewsExplorer intro={intro} promises={promises} reviews={reviews} rating={rating} />

        {empty && (
          <div className="container mx-auto px-4 pb-16">
            <div className="mx-auto max-w-[560px] rounded-2xl border border-dashed border-border p-8 text-center">
              <h2 className="text-xl font-semibold">Reviews are on their way</h2>
              <p className="mt-2 text-sm text-foreground/70">
                We only show reviews written by real users. After you download your resume, we ask how it went. Yours could be first.
              </p>
            </div>
          </div>
        )}
      </div>

      <section>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <CtaSection
            heading="Ready to see your ATS score?"
            subtext="Upload your resume and get a section by section report. Then tell us what you think."
            buttonText="Get started free"
            buttonHref="/resume-checker"
          />
        </div>
      </section>
    </>
  );
}
