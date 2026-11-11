import type { RevenueDay } from "@/lib/admin/daily";
import { usd } from "@/lib/admin/format";

/**
 * Daily revenue as stacked bars: first payments (primary) under renewals
 * (secondary). Plain divs, so it scales with the container on any width.
 */
export function RevenueChart({ days }: { days: RevenueDay[] }) {
  const max = Math.max(0, ...days.map((d) => d.first + d.renewal));
  const total = days.reduce((s, d) => s + d.first + d.renewal, 0);

  return (
    <figure className="rounded-lg border bg-card p-4">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Revenue by day (UTC)</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-primary" /> First payment
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-secondary" /> Renewal
          </span>
        </span>
      </figcaption>

      {total === 0 ? (
        <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">No payments in this range.</p>
      ) : (
        <>
          <div className="mb-1 text-right text-[11px] tabular-nums text-muted-foreground">{usd(max)}</div>
          <div className="flex h-40 items-end gap-px border-b" role="img" aria-label={`Revenue by day, ${usd(total)} in total`}>
            {days.map((d) => {
              const sum = d.first + d.renewal;
              return (
                <div
                  key={d.day}
                  title={`${d.day}: ${usd(d.first)} first, ${usd(d.renewal)} renewals`}
                  className="flex h-full min-w-0 flex-1 flex-col-reverse"
                >
                  <div className="w-full bg-primary" style={{ height: `${max ? (d.first / max) * 100 : 0}%` }} />
                  <div className="w-full bg-secondary" style={{ height: `${max ? (d.renewal / max) * 100 : 0}%` }} />
                  {sum === 0 && <div className="h-px w-full bg-muted" />}
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>{days[0]?.day}</span>
            <span>{days[days.length - 1]?.day}</span>
          </div>
        </>
      )}
    </figure>
  );
}
