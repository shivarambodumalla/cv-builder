import { Suspense } from "react";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { ListSkeleton, LoadError } from "@/components/admin/home/block";
import { getSignupsByChannel } from "@/lib/admin/daily";
import { rangeQuery, type ResolvedRange } from "@/lib/admin/date-range";
import { int, pct } from "@/lib/admin/format";

/** Signups in the page's ?range by first-touch channel, each opening to its sources. */
export function SignupsByChannel({ range }: { range: ResolvedRange }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Signups by channel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Where each new account first came from. Source tracking started Nov 2026; earlier signups show as Unknown.
          </p>
        </div>
        <DateRangePicker fallback="30d" className="shrink-0" />
      </div>
      <Suspense key={rangeQuery(range)} fallback={<ListSkeleton rows={5} />}>
        <ChannelList range={range} />
      </Suspense>
    </div>
  );
}

async function ChannelList({ range }: { range: ResolvedRange }) {
  const res = await getSignupsByChannel(range);
  if (!res.ok) return <LoadError what="signups by channel" error={res.error} />;
  const { total, rows } = res.data;
  if (total === 0) {
    return <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No signups in this range.</p>;
  }
  const max = Math.max(...rows.map((r) => r.signups));

  return (
    <ul className="divide-y overflow-hidden rounded-lg border bg-card">
      {rows.map((r) => (
        <li key={r.channel}>
          <details className="group">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="w-3 text-xs text-muted-foreground transition-transform group-open:rotate-90">›</span>
              <span className="w-28 shrink-0 truncate font-medium sm:w-36">{r.label}</span>
              <span aria-hidden className="hidden h-2 flex-1 overflow-hidden rounded-full bg-muted sm:block">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.signups / max) * 100}%` }} />
              </span>
              <span className="ml-auto w-14 text-right tabular-nums">{int(r.signups)}</span>
              <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{pct(r.signups, total)}</span>
            </summary>
            <ul className="border-t bg-muted/20 px-3 py-2 text-xs">
              {r.sources.map((s) => (
                <li key={s.source} className="flex justify-between gap-3 py-1 pl-6">
                  <span className="truncate text-muted-foreground">{s.source}</span>
                  <span className="tabular-nums">{int(s.signups)}</span>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
      <li className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
        <span>All signups</span>
        <span className="tabular-nums">{int(total)}</span>
      </li>
    </ul>
  );
}
