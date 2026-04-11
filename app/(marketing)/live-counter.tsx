"use client";

import { useState, useEffect } from "react";

interface Props {
  initialCount: number;
  lastReportAt: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function LiveCounter({ initialCount, lastReportAt }: Props) {
  const [count, setCount] = useState(initialCount);
  const [lastAt, setLastAt] = useState(lastReportAt);
  const [weeklyImproved, setWeeklyImproved] = useState<number | null>(null);
  const [avgImprovement, setAvgImprovement] = useState<number | null>(null);

  // Fetch public stats on mount and periodically
  useEffect(() => {
    async function fetchStats() {
      try {
        const [statsRes, publicRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/stats/public"),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setCount(data.todayCount ?? count);
          setLastAt(data.lastReportAt ?? lastAt);
        }
        if (publicRes.ok) {
          const publicData = await publicRes.json();
          setWeeklyImproved(publicData.cvs_improved_this_week ?? 0);
          setAvgImprovement(publicData.avg_score_improvement ?? 0);
        }
      } catch { /* silent */ }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [count, lastAt]);

  if (count === 0 && !lastAt && weeklyImproved === null) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Be the first to analyse today
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
      <p className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        {weeklyImproved !== null ? weeklyImproved : count} CV{(weeklyImproved !== null ? weeklyImproved : count) !== 1 ? "s" : ""} improved this week
      </p>
      {avgImprovement !== null && avgImprovement > 0 && (
        <p className="flex items-center gap-1.5">
          <span>&middot;</span>
          Average improvement: +{avgImprovement} points
        </p>
      )}
      {lastAt && (
        <p className="flex items-center gap-1.5">
          <span>&middot;</span>
          Last analysis {timeAgo(lastAt)}
        </p>
      )}
    </div>
  );
}
