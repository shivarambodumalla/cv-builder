import { type PaywallSummary } from "@/lib/admin/daily";
import { int, pct } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/**
 * Paywall by feature: who hit it, who clicked pay and who paid, with a click
 * or payment credited to the user's last paywall within the 24h before it.
 * `detailed` adds the modal-shown and conversion columns (Growth › Paywall).
 */
export function PaywallTable({
  summary,
  detailed = false,
  limit,
}: {
  summary: PaywallSummary;
  detailed?: boolean;
  limit?: number;
}) {
  const rows = limit ? summary.rows.slice(0, limit) : summary.rows;
  const hidden = summary.rows.length - rows.length;
  const th = "px-3 py-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap";
  const td = "px-3 py-2 text-right tabular-nums";

  if (summary.rows.length === 0 && summary.direct.clickedPay === 0 && summary.direct.paid === 0) {
    return <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Nobody hit the paywall in this range.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[22rem] text-sm">
        <thead>
          <tr className="border-b">
            <th className={cn(th, "text-left")}>Blocked at</th>
            <th className={th}>Hit</th>
            {detailed && <th className={th}>Modal shown</th>}
            <th className={th}>Clicked pay</th>
            <th className={th}>Paid</th>
            {detailed && <th className={th}>Hit → paid</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.feature} className="border-b last:border-0">
              <td className="px-3 py-2 text-left">{r.label}</td>
              <td className={td}>{int(r.hit)}</td>
              {detailed && <td className={td}>{int(r.modal)}</td>}
              <td className={td}>{int(r.clickedPay)}</td>
              <td className={cn(td, r.paid > 0 && "font-semibold text-success")}>{int(r.paid)}</td>
              {detailed && <td className={td}>{pct(r.paid, r.hit)}</td>}
            </tr>
          ))}
          {hidden > 0 && (
            <tr className="border-b">
              <td colSpan={detailed ? 6 : 4} className="px-3 py-2 text-left text-xs text-muted-foreground">
                +{hidden} more
              </td>
            </tr>
          )}
          {(summary.direct.clickedPay > 0 || summary.direct.paid > 0) && (
            <tr className="border-b text-muted-foreground">
              <td className="px-3 py-2 text-left">No paywall in the 24h before</td>
              <td className={td}>–</td>
              {detailed && <td className={td}>–</td>}
              <td className={td}>{int(summary.direct.clickedPay)}</td>
              <td className={td}>{int(summary.direct.paid)}</td>
              {detailed && <td className={td}>–</td>}
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <td className="px-3 py-2 text-left">All features</td>
            <td className={td}>{int(summary.totals.hit)}</td>
            {detailed && <td className={td}>{int(summary.totals.modal)}</td>}
            <td className={td}>{int(summary.totals.clickedPay)}</td>
            <td className={td}>{int(summary.totals.paid)}</td>
            {detailed && <td className={td}>{pct(summary.totals.paid, summary.totals.hit)}</td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

