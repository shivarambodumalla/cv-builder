import type { Metadata } from "next";
import { Suspense } from "react";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { BlockHeading, ListSkeleton, TilesSkeleton } from "@/components/admin/home/block";
import { MoneyBlock } from "@/components/admin/home/money-block";
import { JourneyStrip } from "@/components/admin/home/journey-strip";
import { NeedsReply } from "@/components/admin/home/needs-reply";
import { PaywallBlock } from "@/components/admin/home/paywall-block";
import { HealthBlock } from "@/components/admin/home/health-block";
import { Skeleton } from "@/components/ui/skeleton";
import { comparisonLabel, rangeQuery, resolveRange, weekEarlier } from "@/lib/admin/date-range";

export const metadata: Metadata = {
  title: "Home",
};

export const dynamic = "force-dynamic";

/**
 * The daily view: money, the visitor-to-paid journey against the same day
 * last week, what needs a reply, where the paywall bites, and today's costs.
 * Each block loads on its own so one slow query never holds up the rest.
 */
export default function AdminHomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const range = resolveRange(searchParams, "today");
  const compare = weekEarlier(range);
  const q = rangeQuery(range);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Home</h1>
        <DateRangePicker presets={["today", "yesterday", "7d"]} fallback="today" />
      </div>

      <section>
        <BlockHeading title="Money" />
        <Suspense key={q} fallback={<TilesSkeleton />}>
          <MoneyBlock range={range} compare={compare} />
        </Suspense>
      </section>

      <section>
        <BlockHeading title="Journey" note={comparisonLabel(range, "week")} />
        <Suspense key={q} fallback={<Skeleton className="h-[120px] rounded-lg" />}>
          <JourneyStrip range={range} compare={compare} />
        </Suspense>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <BlockHeading title="Needs a reply" />
          <Suspense fallback={<ListSkeleton />}>
            <NeedsReply />
          </Suspense>
        </section>
        <section>
          <BlockHeading title="Paywall" href={`/admin/growth/paywall?${q}`} linkLabel="All features" />
          <Suspense key={q} fallback={<ListSkeleton />}>
            <PaywallBlock range={range} limit={6} />
          </Suspense>
        </section>
      </div>

      <section>
        <BlockHeading title="Cost and health" note="today, UTC" />
        <Suspense fallback={<TilesSkeleton />}>
          <HealthBlock />
        </Suspense>
      </section>
    </div>
  );
}
