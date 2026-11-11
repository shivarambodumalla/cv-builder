import { cn } from "@/lib/utils";
import { channelColor } from "./format";
import type { Channel } from "./types";

export function ChannelChart({ channels }: { channels: Channel[] }) {
  const total = channels.reduce((s, c) => s + c.sessions, 0) || 1;
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Traffic channels</h3>
      {channels.length === 0 ? (
        <p className="text-sm text-muted-foreground">No channel data available.</p>
      ) : (
        <div className="space-y-3">
          {channels.map((c) => (
            <div key={c.channel}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block w-2 h-2 rounded-full", channelColor(c.channel))} />
                  <span className="font-medium">{c.channel}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground tabular-nums">
                  <span>{c.sessions.toLocaleString()} sessions</span>
                  <span>{Math.round((c.sessions / total) * 100)}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full opacity-75", channelColor(c.channel))}
                  style={{ width: `${(c.sessions / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
