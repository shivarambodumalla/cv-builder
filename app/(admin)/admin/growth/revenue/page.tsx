import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatTile } from "@/components/admin/stat-tile";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { ListSkeleton, LoadError, TilesSkeleton } from "@/components/admin/home/block";
import { getRevenue, RENEWALS_RECORDED_FROM, type PaymentType } from "@/lib/admin/daily";
import { rangeQuery, resolveRange, type ResolvedRange } from "@/lib/admin/date-range";
import { int, periodSplit, plural, usd } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { RevenueChart } from "./revenue-chart";

export const metadata: Metadata = { title: "Revenue · Growth" };
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<PaymentType, string> = {
  first: "First payment",
  renewal: "Renewal",
  refund: "Refund",
  cancel: "Cancelled",
};

export default function GrowthRevenuePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const range = resolveRange(searchParams);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Revenue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pre-tax USD from Lemon Squeezy. Renewals are recorded from {RENEWALS_RECORDED_FROM} onward (the webhook
            didn&apos;t record them before), so earlier renewal revenue is missing.
          </p>
        </div>
        <DateRangePicker className="shrink-0" />
      </div>
      <Suspense
        key={rangeQuery(range)}
        fallback={
          <div className="space-y-4">
            <TilesSkeleton count={6} />
            <ListSkeleton rows={6} />
          </div>
        }
      >
        <RevenueDetail range={range} />
      </Suspense>
    </div>
  );
}

async function RevenueDetail({ range }: { range: ResolvedRange }) {
  const res = await getRevenue(range);
  if (!res.ok) return <LoadError what="revenue" error={res.error} />;
  const { summary: s, activePro, days, latest } = res.data;
  const th = "px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Revenue" value={usd(s.revenue)} note="first payments + renewals" />
        <StatTile
          label="First payments"
          value={int(s.firstPayments.count)}
          note={[usd(s.firstPayments.sum), periodSplit(s.firstPayments.byPeriod)].filter(Boolean).join(" · ")}
        />
        <StatTile label="Renewals" value={int(s.renewals.count)} note={usd(s.renewals.sum)} />
        <StatTile label="Cancellations" value={int(s.cancellations)} tone={s.cancellations ? "warning" : "neutral"} note="in-app cancels" />
        <StatTile
          label="Refunds"
          value={int(s.refunds.count)}
          note={s.refunds.count ? usd(s.refunds.sum) : "none"}
          tone={s.refunds.count ? "error" : "neutral"}
        />
      </div>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active Pro now</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="All periods" value={int(activePro.total)} note="paid term not over" />
          {["weekly", "monthly", "yearly"].map((p) => (
            <StatTile key={p} label={p[0].toUpperCase() + p.slice(1)} value={int(activePro.byPeriod[p] ?? 0)} />
          ))}
        </div>
        {Object.keys(activePro.byPeriod).some((p) => !["weekly", "monthly", "yearly"].includes(p)) && (
          <p className="mt-2 text-xs text-muted-foreground">
            Also {periodSplit(Object.fromEntries(Object.entries(activePro.byPeriod).filter(([p]) => !["weekly", "monthly", "yearly"].includes(p))))}{" "}
            (granted by an admin or no period on file).
          </p>
        )}
      </section>

      <RevenueChart days={days} />

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Latest payments <span className="font-normal normal-case tracking-normal">({plural(latest.length, "event")})</span>
        </h3>
        {latest.length === 0 ? (
          <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No payments in this range.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b">
                  <th className={th}>Date (UTC)</th>
                  <th className={th}>User</th>
                  <th className={th}>Period</th>
                  <th className={cn(th, "text-right")}>Amount</th>
                  <th className={th}>Type</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{e.at.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-3 py-2">
                      {e.userNumber ? (
                        <Link
                          href={`/admin/users/${e.userNumber}`}
                          className="inline-flex min-h-[44px] items-center text-primary hover:underline sm:min-h-0"
                        >
                          #{e.userNumber}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Deleted</span>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">{e.period ?? "–"}</td>
                    <td className={cn("px-3 py-2 text-right tabular-nums", e.amount < 0 && "text-error")}>{usd(e.amount)}</td>
                    <td className="px-3 py-2">{TYPE_LABEL[e.type]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
