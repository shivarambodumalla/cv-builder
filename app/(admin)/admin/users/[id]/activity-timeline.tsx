"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ActivityEvent {
  id: string;
  event: string;
  page: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ATS_EVENTS = /ats|fix all|rewrite/i;
const JOB_EVENTS = /job match|red flag|offer eval|tailor/i;
const CV_EVENTS = /\bcv\b|pdf|template|resume/i;
const UPGRADE_EVENTS = /upgrade/i;
const LIMIT_EVENTS = /\blimit\b/i;
const PAGE_EVENTS = /^opened /i;

function eventColor(event: string): string {
  if (LIMIT_EVENTS.test(event)) return "#DC2626";
  if (UPGRADE_EVENTS.test(event)) return "#F59E0B";
  if (ATS_EVENTS.test(event)) return "#065F46";
  if (JOB_EVENTS.test(event)) return "#2563EB";
  if (CV_EVENTS.test(event)) return "#7C3AED";
  if (PAGE_EVENTS.test(event)) return "#9CA3AF";
  return "#78716C";
}

function categorize(event: string): string {
  if (LIMIT_EVENTS.test(event)) return "Limits";
  if (UPGRADE_EVENTS.test(event)) return "Upgrade";
  if (ATS_EVENTS.test(event)) return "ATS";
  if (JOB_EVENTS.test(event)) return "Job match";
  if (CV_EVENTS.test(event)) return "CV";
  if (PAGE_EVENTS.test(event)) return "Page views";
  return "Other";
}

function formatTime(iso: string): { primary: string; secondary: string } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.round(diffMs / 60000);

  // Absolute date+time always shown
  const absolute = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Relative only for < 60 min
  if (mins < 1) return { primary: "just now", secondary: absolute };
  if (mins < 60) return { primary: `${mins}m ago`, secondary: absolute };

  // For older events, show absolute as primary
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
    return { primary: `Today, ${time}`, secondary: "" };
  }
  if (isYesterday) {
    const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
    return { primary: `Yesterday, ${time}`, secondary: "" };
  }

  return { primary: absolute, secondary: d.getFullYear() !== now.getFullYear() ? String(d.getFullYear()) : "" };
}

function renderMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "";
  const parts: string[] = [];
  if (metadata.score !== undefined) parts.push(`score: ${metadata.score}`);
  if (metadata.grade !== undefined) parts.push(`grade: ${metadata.grade}`);
  if (metadata.template !== undefined) parts.push(`template: ${metadata.template}`);
  if (metadata.tone !== undefined) parts.push(`tone: ${metadata.tone}`);
  if (metadata.mode !== undefined) parts.push(`mode: ${metadata.mode}`);
  if (metadata.trigger !== undefined) parts.push(`trigger: ${metadata.trigger}`);
  if (metadata.count !== undefined) parts.push(`count: ${metadata.count}`);
  if (metadata.changes !== undefined) parts.push(`changes: ${metadata.changes}`);
  return parts.join(" · ");
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Activity is tracked from this point forward.</p>
        </CardContent>
      </Card>
    );
  }

  // Summary stats
  const totalActions = events.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = events.filter((e) => new Date(e.created_at).getTime() > weekAgo).length;

  const categoryCounts = new Map<string, number>();
  for (const e of events) {
    const cat = categorize(e.event);
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  const [mostUsed] = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Activity</CardTitle>
          <span className="text-xs text-muted-foreground">Last {totalActions} actions</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-muted/30">
          <div className="px-3 py-2">
            <p className="text-[10px] uppercase text-muted-foreground">Total actions</p>
            <p className="mt-0.5 text-lg font-bold">{totalActions}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] uppercase text-muted-foreground">This week</p>
            <p className="mt-0.5 text-lg font-bold">{thisWeek}</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] uppercase text-muted-foreground">Most used</p>
            <p className="mt-0.5 text-sm font-semibold truncate">{mostUsed?.[0] ?? "—"}</p>
          </div>
        </div>

        {/* Timeline */}
        <ul className="space-y-2">
          {events.map((e) => {
            const meta = renderMetadata(e.metadata);
            const time = formatTime(e.created_at);
            return (
              <li key={e.id} className="flex items-start gap-3 text-sm">
                <span
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full")}
                  style={{ backgroundColor: eventColor(e.event) }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium">{e.event}</p>
                    <span className="shrink-0 text-right text-xs text-muted-foreground">
                      {time.primary}
                      {time.secondary && (
                        <span className="ml-1.5 opacity-60">{time.secondary}</span>
                      )}
                    </span>
                  </div>
                  {(meta || e.page) && (
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {meta && <Badge variant="secondary" className="text-[10px]">{meta}</Badge>}
                      {e.page && <span className="truncate font-mono">{e.page}</span>}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
