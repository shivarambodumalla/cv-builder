import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDuration, qualityBadge, qualityLabel } from "./format";
import type { DeviceRow } from "./types";

const DEVICE_ICONS: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export function DeviceIntelligence({ devices }: { devices: DeviceRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Device Intelligence</h3>
      {devices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No device data available.</p>
      ) : (
        <>
          {/* Share bars */}
          <div className="flex rounded-lg overflow-hidden h-3">
            {devices.map((d, i) => (
              <div
                key={d.device}
                className={cn(
                  "h-full transition-all",
                  i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : "bg-violet-500"
                )}
                style={{ width: `${d.sharePercent}%`, opacity: 0.8 }}
                title={`${d.device}: ${d.sharePercent}%`}
              />
            ))}
          </div>

          {/* Device cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {devices.map((d, i) => {
              const Icon = DEVICE_ICONS[d.device.toLowerCase()] ?? Monitor;
              const color = i === 0 ? "text-primary" : i === 1 ? "text-blue-500" : "text-violet-500";
              return (
                <div key={d.device} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                    <span className="text-xs font-medium capitalize">{d.device}</span>
                    <span className="ml-auto text-xs font-bold">{d.sharePercent}%</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sessions</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {d.sessions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engaged</span>
                      <span className="tabular-nums font-medium text-foreground">{d.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg time</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {fmtDuration(d.avgDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages/visit</span>
                      <span className="tabular-nums font-medium text-foreground">{d.pagesPerSession}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded w-fit",
                      qualityBadge(d.qualityScore)
                    )}
                  >
                    {qualityLabel(d.qualityScore)} quality · {d.qualityScore}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
