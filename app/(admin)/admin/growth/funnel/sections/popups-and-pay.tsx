import { BadgeCheck, CircleSlash, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { rateTone, TONE_TEXT } from "./format";
import type { PayClicker, PopupMetric } from "./types";

export function PopupPerformance({ popups }: { popups: PopupMetric[] }) {
  if (!popups.some((pp) => pp.shown > 0)) return null;
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-4">
        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Popup Performance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">Popup</th>
              <th className="pb-2 text-right font-medium">Shown</th>
              <th className="pb-2 text-right font-medium">Clicked</th>
              <th className="pb-2 text-right font-medium">Dismissed</th>
              <th className="pb-2 text-right font-medium">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {popups.map((pp) => (
              <tr key={pp.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{pp.label}</td>
                <td className="py-2 text-right tabular-nums">{pp.shown}</td>
                <td className="py-2 text-right tabular-nums text-success font-semibold">{pp.clicked}</td>
                <td className="py-2 text-right tabular-nums text-muted-foreground">{pp.dismissed}</td>
                <td className="py-2 text-right">
                  <span
                    className={cn(
                      "font-bold tabular-nums",
                      pp.conversionPct >= 20 ? "text-success" : pp.conversionPct >= 5 ? "text-warning" : "text-muted-foreground"
                    )}
                  >
                    {pp.conversionPct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Pay button: who clicked and who went on to pay. */
export function PayButton({ payClickers }: { payClickers: PayClicker[] }) {
  if (payClickers.length === 0) return null;
  const clicked = payClickers.length;
  const paid = payClickers.filter((c) => c.converted).length;
  const rate = Math.round((paid / clicked) * 1000) / 10;
  const stalled = clicked - paid;
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-1">
        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Pay Button</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {clicked} clicked · {paid} paid ·{" "}
        <span className={cn("font-semibold", TONE_TEXT[rateTone(rate, 50, 20)])}>{rate}% completed</span>
        {stalled > 0 && ` · ${stalled} did not complete`}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">User</th>
              <th className="pb-2 font-medium">Plan</th>
              <th className="pb-2 text-right font-medium">Clicks</th>
              <th className="pb-2 font-medium">Last clicked</th>
              <th className="pb-2 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {payClickers.map((c) => (
              <tr key={c.userId} className="border-b last:border-0">
                <td className="py-2 font-medium">{c.email || c.userId.slice(0, 8)}</td>
                <td className="py-2 capitalize text-muted-foreground">{c.period}</td>
                <td className="py-2 text-right tabular-nums">{c.attempts}</td>
                <td className="py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(c.lastClickedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </td>
                <td className="py-2">
                  {c.converted ? (
                    <span className="inline-flex items-center gap-1 text-success font-semibold">
                      <BadgeCheck className="h-3 w-3" /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <CircleSlash className="h-3 w-3" /> Did not complete
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
