// Payment wall (upgrade modal) outcomes, from the "Saw upgrade modal" /
// "Dismissed upgrade modal" rows that context/upgrade-modal-context.tsx logs.
// The "Get Pro" click itself is not logged: checkout redirects away without
// closing the modal, so an open with no dismiss is the closest proxy (it also
// counts closed tabs). Only signed-in users reach user_activity.

export interface WallEvent {
  user_id: string;
  event: string;
  created_at: string;
}

export interface WallDay {
  day: string;
  skipped: number;
  notClosed: number;
  users: number;
}

const DUPLICATE_OPEN_MS = 5_000;

export function summarizePaymentWall(events: WallEvent[], days: string[]) {
  const byUser = new Map<string, WallEvent[]>();
  for (const e of events) {
    if (!byUser.has(e.user_id)) byUser.set(e.user_id, []);
    byUser.get(e.user_id)!.push(e);
  }

  const opens: { userId: string; day: string; skipped: boolean }[] = [];
  for (const [userId, list] of byUser) {
    list.sort((a, b) => a.created_at.localeCompare(b.created_at));
    let current: { userId: string; day: string; skipped: boolean; at: number; closed: boolean } | null = null;
    for (const e of list) {
      const at = new Date(e.created_at).getTime();
      if (e.event === "Saw upgrade modal") {
        if (current && !current.closed && at - current.at < DUPLICATE_OPEN_MS) continue;
        current = { userId, day: e.created_at.slice(0, 10), skipped: false, at, closed: false };
        opens.push(current);
      } else if (current && !current.closed) {
        current.closed = true;
        current.skipped = true;
      }
    }
  }

  const series: WallDay[] = days.map((day) => {
    const dayOpens = opens.filter((o) => o.day === day);
    return {
      day,
      skipped: dayOpens.filter((o) => o.skipped).length,
      notClosed: dayOpens.filter((o) => !o.skipped).length,
      users: new Set(dayOpens.map((o) => o.userId)).size,
    };
  });

  const inRange = opens.filter((o) => days.includes(o.day));
  return {
    series,
    totalOpens: inRange.length,
    totalSkipped: inRange.filter((o) => o.skipped).length,
    totalUsers: new Set(inRange.map((o) => o.userId)).size,
    userIds: new Set(inRange.map((o) => o.userId)),
  };
}
