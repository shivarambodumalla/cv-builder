import {
  BadgeCheck, Briefcase, CreditCard, Crown, Download, FileText, Home, Layout, LogIn, Mail,
  MousePointerClick, Pencil, ScanLine, Sparkles, Upload, UserPlus, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fp, p } from "./format";
import type { Stage } from "./types";

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home, "log-in": LogIn, "user-plus": UserPlus, layout: Layout, upload: Upload, "file-text": FileText,
  edit: Pencil, scan: ScanLine, sparkles: Sparkles, wand: Wand2, briefcase: Briefcase, mail: Mail,
  download: Download, "credit-card": CreditCard, crown: Crown,
  "mouse-pointer-click": MousePointerClick, "badge-check": BadgeCheck,
};

export function FunnelSection({ title, desc, stages, base, accent }: { title: string; desc: string; stages: Stage[]; base: number; accent: string }) {
  const top = stages[0]?.count ?? 0;
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <div className={cn("h-2 w-2 rounded-full", accent)} />
        <div><h2 className="text-sm font-semibold">{title}</h2><p className="text-[11px] text-muted-foreground">{desc}</p></div>
      </div>
      <div className="px-4 pt-4 pb-2 overflow-x-auto">
        <div className="flex items-end gap-3" style={{ height: 160, minWidth: stages.length * 80 }}>
          {stages.map((s, i) => {
            const barH = Math.max((s.count / (top || 1)) * 120, 4);
            const stepPct = i > 0 && stages[i - 1].count > 0 ? p(s.count, stages[i - 1].count) : null;
            const Icon = ICON_MAP[s.icon || ""] || FileText;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1 flex-1" style={{ minWidth: 70 }}>
                <span className="text-xs font-bold tabular-nums">{s.count.toLocaleString()}</span>
                {stepPct !== null && (
                  <span className={cn("text-[9px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full", stepPct >= 60 ? "bg-success/15 text-success" : stepPct >= 30 ? "bg-warning/15 text-warning" : "bg-error/15 text-error")}>{fp(stepPct)}</span>
                )}
                {i === 0 && <div className="h-5" />}
                <div className={cn("w-full rounded-t-md", accent, i > 0 && "opacity-80")} style={{ height: barH, maxWidth: 56 }} />
                <Icon className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-nowrap">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Stage</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Users</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">% of Base</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Step Conv.</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Drop</th>
          </tr></thead>
          <tbody>
            {stages.map((s, i) => {
              const prev = i === 0 ? s.count : stages[i - 1].count;
              const stepConv = i === 0 ? 100 : p(s.count, prev);
              const drop = i === 0 ? 0 : p(prev - s.count, prev);
              const Icon = ICON_MAP[s.icon || ""] || FileText;
              return (
                <tr key={s.key} className={cn("border-b last:border-0", drop > 50 && i > 0 && "bg-error/5")}>
                  <td className="px-4 py-2"><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span className="font-medium">{s.label}</span></div></td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums">{s.count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{fp(p(s.count, base))}</td>
                  <td className="px-4 py-2 text-right">{i === 0 ? <span className="text-muted-foreground">–</span> : <span className={cn("font-semibold tabular-nums", stepConv >= 60 ? "text-success" : stepConv >= 30 ? "text-warning" : "text-error")}>{fp(stepConv)}</span>}</td>
                  <td className="px-4 py-2 text-right">{i === 0 ? <span className="text-muted-foreground">–</span> : drop > 0 ? <span className={cn("font-semibold tabular-nums", drop >= 50 ? "text-error" : drop >= 30 ? "text-warning" : "text-muted-foreground")}>{fp(drop)}</span> : <span className="text-success font-semibold">0%</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
