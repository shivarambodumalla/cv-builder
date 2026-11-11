import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatTile, type Tone } from "@/components/admin/stat-tile";
import { fp, p, rateTone, TONE_TEXT } from "./format";

function trendTone(pct: number, good: number): Tone {
  return pct >= good ? "success" : pct > 0 ? "neutral" : "error";
}

export function HeroMetrics({
  pageViews,
  uniqueVisitors,
  awarenessBase,
  signups,
  cvsCreated,
  upgraded,
  visitToSignup,
}: {
  pageViews: number;
  uniqueVisitors: number;
  awarenessBase: number;
  signups: number;
  cvsCreated: number;
  upgraded: number;
  visitToSignup: number;
}) {
  const signupToCV = p(cvsCreated, signups);
  const signupToPro = p(upgraded, signups);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        label="Page Views"
        value={pageViews.toLocaleString()}
        note={uniqueVisitors > 0 ? `${uniqueVisitors.toLocaleString()} unique visitors` : undefined}
      />
      <StatTile
        label="Signups"
        value={signups.toLocaleString()}
        note={awarenessBase > 0 ? `${fp(visitToSignup)} of visitors` : undefined}
        tone={trendTone(visitToSignup, 5)}
      />
      <StatTile
        label="CVs Created"
        value={cvsCreated.toLocaleString()}
        note={signups > 0 ? `${fp(signupToCV)} of signups` : undefined}
        tone={trendTone(signupToCV, 50)}
      />
      <StatTile
        label="Pro Upgrades"
        value={upgraded.toLocaleString()}
        note={signups > 0 ? `${fp(signupToPro)} conversion` : undefined}
      />
    </div>
  );
}

export function ConversionFunnel({ steps }: { steps: { label: string; count: number; color: string }[] }) {
  const maxW = steps[0]?.count || 1;
  return (
    <div className="rounded-xl border p-5">
      <h2 className="text-sm font-semibold mb-4">Conversion Funnel</h2>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {steps.map((step, i, arr) => {
          const barPct = Math.max((step.count / maxW) * 100, 3);
          const prevCount = i > 0 ? arr[i - 1].count : step.count;
          const convPct = prevCount > 0 ? Math.min(p(step.count, prevCount), 100) : 0;
          return (
            <div key={step.label} className="flex items-center flex-1 min-w-[100px]">
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] font-medium">{step.label}</span>
                  <span className="text-xs font-bold tabular-nums">{step.count.toLocaleString()}</span>
                </div>
                <div className="h-8 rounded-md bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-md transition-all duration-700", step.color)} style={{ width: `${barPct}%` }} />
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="flex flex-col items-center px-1.5 shrink-0">
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className={cn("text-[9px] font-bold tabular-nums mt-0.5", TONE_TEXT[rateTone(convPct, 50, 20)])}>
                    {fp(convPct)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
