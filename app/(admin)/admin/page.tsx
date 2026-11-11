import type { Metadata } from "next";
import { Suspense } from "react";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { TilesSkeleton } from "@/components/admin/home/block";
import { NeedsReply } from "@/components/admin/home/needs-reply";
import {
  AiCostCard,
  AudienceCard,
  CountriesCard,
  FunnelCard,
  KpiGrid,
  PaywallCard,
  RevenueCard,
  SignupsCard,
  SourcesCard,
  TopPagesCard,
  TopUsersCard,
  TrafficCard,
} from "@/components/admin/home/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { comparisonLabel, previousRange, rangeQuery, RANGE_LABELS, resolveRange } from "@/lib/admin/date-range";
import { LegacyDashboard } from "@/components/admin/home/legacy-dashboard";
import {
  dashboardFunctionsReady,
  getBreakdown,
  getFunnel,
  getOverview,
  getTopPages,
  getTopUsers,
  type TopUsersOrder,
} from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title: "Home",
};

export const dynamic = "force-dynamic";

const TOP_ORDERS: TopUsersOrder[] = ["actions", "time", "ai_cost"];

function CardSkeleton({ className = "h-[320px]" }: { className?: string }) {
  return <Skeleton className={`rounded-xl ${className}`} aria-busy />;
}

function formatDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * The admin dashboard. Every query starts once, here, and each card waits only
 * for its own data, so one slow query never holds up the page. Default range
 * is month to date; numbers compare against the same number of days before.
 */
export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!(await dashboardFunctionsReady())) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Home</h1>
        <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          Showing the previous dashboard. The new one, with charts, funnel and date ranges, turns on by itself
          once <code className="font-mono text-xs">supabase/migrations/00085_admin_dashboard_functions.sql</code> has
          been run in Supabase.
        </p>
        <LegacyDashboard />
      </div>
    );
  }

  const range = resolveRange(searchParams);
  const previous = previousRange(range);
  const rawOrder = Array.isArray(searchParams.top) ? searchParams.top[0] : searchParams.top;
  const order: TopUsersOrder = TOP_ORDERS.includes(rawOrder as TopUsersOrder) ? (rawOrder as TopUsersOrder) : "actions";

  const overview = getOverview(range);
  const funnel = getFunnel(range);
  const topPages = getTopPages(range);
  const topUsers = getTopUsers(range, order);
  const breakdown = getBreakdown(range);

  const span = range.days === 1 ? formatDay(range.from) : `${formatDay(range.from)} – ${formatDay(range.to)}`;
  const compareSpan =
    previous.days === 1 ? formatDay(previous.from) : `${formatDay(previous.from)} – ${formatDay(previous.to)}`;
  const topHref = (o: TopUsersOrder) => `/admin?${rangeQuery(range)}&top=${o}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {RANGE_LABELS[range.preset]} · {span}
            <span className="hidden sm:inline"> · compared with {compareSpan}</span>
          </p>
        </div>
        <DateRangePicker />
      </div>

      <Suspense fallback={<CardSkeleton className="h-14" />}>
        <NeedsReply />
      </Suspense>

      <Suspense fallback={<TilesSkeleton count={6} className="md:grid-cols-3 xl:grid-cols-6" />}>
        <KpiGrid data={overview} compareLabel={comparisonLabel(range, "previous")} />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<CardSkeleton />}>
            <TrafficCard data={overview} />
          </Suspense>
        </div>
        <Suspense fallback={<CardSkeleton />}>
          <FunnelCard data={funnel} />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <SignupsCard data={overview} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <PaywallCard data={overview} />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Suspense fallback={<CardSkeleton />}>
          <TopPagesCard data={topPages} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <TopUsersCard data={topUsers} order={order} hrefFor={topHref} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <CountriesCard data={breakdown} />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <RevenueCard data={overview} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <AiCostCard data={overview} />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton className="h-[220px]" />}>
          <AudienceCard data={breakdown} />
        </Suspense>
        <Suspense fallback={<CardSkeleton className="h-[220px]" />}>
          <SourcesCard data={breakdown} />
        </Suspense>
      </div>
    </div>
  );
}
