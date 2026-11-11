import { Suspense } from "react";
import { StatTile } from "@/components/admin/stat-tile";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { ListSkeleton, LoadError, TilesSkeleton } from "@/components/admin/home/block";
import { PaywallTable } from "@/components/admin/home/paywall-table";
import {
  getPaywall,
  getPaywallLaunchComparison,
  PAYWALL_LAUNCH_DAY,
  type PaywallEra,
} from "@/lib/admin/daily";
import { rangeQuery, type ResolvedRange } from "@/lib/admin/date-range";
import { int, pct, plural } from "@/lib/admin/format";

/** Per-feature paywall conversion for the page's ?range, plus the launch before/after. */
export function PaywallConversion({ range }: { range: ResolvedRange }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Paywall conversion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Who hit each limit, saw the upgrade modal, clicked pay and paid. A click or payment counts toward the
            user&apos;s last paywall in the 24 hours before it.
          </p>
        </div>
        <DateRangePicker fallback="30d" className="shrink-0" />
      </div>

      <Suspense key={rangeQuery(range)} fallback={<><TilesSkeleton count={3} /><ListSkeleton rows={6} /></>}>
        <FeatureTable range={range} />
      </Suspense>

      <Suspense fallback={<ListSkeleton rows={3} />}>
        <LaunchComparison />
      </Suspense>
    </div>
  );
}

async function FeatureTable({ range }: { range: ResolvedRange }) {
  const res = await getPaywall(range);
  if (!res.ok) return <LoadError what="paywall conversion" error={res.error} />;
  const s = res.data;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Hit the paywall" value={int(s.totals.hit)} note={`${int(s.totals.modal)} saw the modal`} />
        <StatTile label="Clicked pay" value={int(s.totals.clickedPay)} note={`${pct(s.totals.clickedPay, s.totals.hit)} of hits`} />
        <StatTile
          label="Paid after a paywall"
          value={int(s.totals.paid)}
          note={`${pct(s.totals.paid, s.totals.hit)} of hits`}
          tone={s.totals.paid > 0 ? "success" : "neutral"}
        />
        <StatTile
          label="Abandoned checkouts"
          value={int(s.abandoned.checkouts)}
          note={`${plural(s.abandoned.users, "user")} never finished paying`}
          tone={s.abandoned.checkouts > 0 ? "warning" : "neutral"}
          href={`/admin/growth/funnel?${rangeQuery(range)}`}
        />
      </div>
      <PaywallTable summary={s} detailed />
    </div>
  );
}

async function LaunchComparison() {
  const res = await getPaywallLaunchComparison();
  if (!res.ok) return <LoadError what="the launch comparison" error={res.error} />;
  const { before, after } = res.data;
  const eras: PaywallEra[] = [before, after];
  const th = "px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap";
  const td = "px-3 py-2 text-right tabular-nums";

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">Before vs after 9 Nov</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The free-plan paywall launched on {PAYWALL_LAUNCH_DAY}. The first row is the 30 days before, the second every
          day since, so compare the rates, not the totals. Clicked pay and Paid include people who never hit a paywall.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b">
              <th className={`${th} text-left`}>Period</th>
              <th className={th}>Days</th>
              <th className={th}>Signups</th>
              <th className={th}>Hit paywall</th>
              <th className={th}>Clicked pay</th>
              <th className={th}>Paid</th>
              <th className={th}>Hit → paid</th>
              <th className={th}>Paid per 100 signups</th>
            </tr>
          </thead>
          <tbody>
            {eras.map((e) => {
              const paidAll = e.summary.totals.paid + e.summary.direct.paid;
              const clickedAll = e.summary.totals.clickedPay + e.summary.direct.clickedPay;
              return (
                <tr key={e.label} className="border-b last:border-0">
                  <td className="px-3 py-2 text-left">
                    <span className="block font-medium">{e.label}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {e.range.from} to {e.range.to}
                    </span>
                  </td>
                  <td className={td}>{int(e.range.days)}</td>
                  <td className={td}>{int(e.signups)}</td>
                  <td className={td}>{int(e.summary.totals.hit)}</td>
                  <td className={td}>{int(clickedAll)}</td>
                  <td className={td}>{int(paidAll)}</td>
                  <td className={td}>{pct(e.summary.totals.paid, e.summary.totals.hit)}</td>
                  <td className={td}>{e.signups ? ((paidAll / e.signups) * 100).toFixed(1) : "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
