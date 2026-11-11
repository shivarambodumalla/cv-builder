import { StatTile, type Tone } from "@/components/admin/stat-tile";
import { getHealth } from "@/lib/admin/daily";
import { int, pct, plural, usd } from "@/lib/admin/format";
import { LoadError } from "./block";

/** Today's AI spend, AI failures and email bounces (UTC day, whatever the page range). */
export async function HealthBlock() {
  const res = await getHealth();
  if (!res.ok) return <LoadError what="cost and health" error={res.error} />;
  const h = res.data;

  const spendRatio = h.spendUsd / h.capUsd;
  const spendTone: Tone = spendRatio >= 1 ? "error" : spendRatio >= 0.8 ? "warning" : "neutral";
  const errorTone: Tone = h.errors === 0 ? "success" : h.errors / Math.max(1, h.calls) >= 0.05 ? "error" : "warning";
  const emailTone: Tone = h.complaints > 0 ? "error" : h.bounces > 0 ? "warning" : "success";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="AI spend today"
        value={usd(h.spendUsd)}
        note={`${pct(h.spendUsd, h.capUsd)} of ${usd(h.capUsd)} cap`}
        tone={spendTone}
        meter={spendRatio}
        href="/admin/ai/usage"
      />
      <StatTile
        label="AI cost per signup"
        value={h.signupsToday ? usd(h.spendUsd / h.signupsToday) : "–"}
        note={h.signupsToday ? plural(h.signupsToday, "signup") + " today" : "no signups yet today"}
        href="/admin/ai/usage"
      />
      <StatTile
        label="AI errors"
        value={int(h.errors)}
        note={`of ${plural(h.calls, "call")}`}
        tone={errorTone}
        href="/admin/ai/usage"
      />
      <StatTile
        label="Email bounces"
        value={int(h.bounces + h.complaints)}
        note={h.bounces + h.complaints === 0 ? "none today" : plural(h.complaints, "complaint")}
        tone={emailTone}
        href="/admin/email/logs"
      />
    </div>
  );
}
