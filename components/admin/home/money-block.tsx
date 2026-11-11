import { StatTile, changeNote } from "@/components/admin/stat-tile";
import { getMoney } from "@/lib/admin/daily";
import { comparisonLabel, rangeQuery, type ResolvedRange } from "@/lib/admin/date-range";
import { int, periodSplit, plural, usd } from "@/lib/admin/format";
import { LoadError } from "./block";

/** "today", "yesterday" or "this range", for notes under a tile. */
export function rangeWord(range: ResolvedRange): string {
  if (range.preset === "today") return "today";
  if (range.preset === "yesterday") return "yesterday";
  return "this range";
}

export async function MoneyBlock({ range, compare }: { range: ResolvedRange; compare: ResolvedRange }) {
  const res = await getMoney(range, compare);
  if (!res.ok) return <LoadError what="payments" error={res.error} />;
  const { current, previous, activePro } = res.data;
  const href = `/admin/growth/revenue?${rangeQuery(range)}`;
  const vs = comparisonLabel(range, "week");

  const revenueNote = [
    periodSplit(current.firstPayments.byPeriod),
    current.renewals.count ? plural(current.renewals.count, "renewal") : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const newPro = changeNote(current.firstPayments.users, previous.firstPayments.users, vs);
  const net = current.firstPayments.users - current.cancellations - current.refunds.count;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Revenue" value={usd(current.revenue)} note={revenueNote || `no payments ${rangeWord(range)}`} href={href} />
      <StatTile label="New Pro" value={int(current.firstPayments.users)} note={newPro.note} tone={newPro.tone} href={href} />
      <StatTile
        label="Cancelled"
        value={int(current.cancellations)}
        note={plural(current.refunds.count, "refund")}
        tone={current.refunds.count ? "warning" : "neutral"}
        href={href}
      />
      <StatTile
        label="Active Pro"
        value={int(activePro.total)}
        note={`${net > 0 ? "+" : ""}${net} net ${rangeWord(range)}`}
        tone={net > 0 ? "success" : net < 0 ? "warning" : "neutral"}
        href={href}
      />
    </div>
  );
}
