export function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
    ? `${(n / 1000).toFixed(1)}k`
    : String(n);
}

export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDuration(secs: number) {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function positionBadge(pos: number) {
  if (pos <= 3) return "bg-success/15 text-success";
  if (pos <= 10) return "bg-warning/15 text-warning";
  return "bg-muted text-muted-foreground";
}

export function qualityBadge(score: number) {
  if (score >= 70) return "bg-success/15 text-success";
  if (score >= 40) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

export function qualityLabel(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + 127397));
  } catch {
    return "🌐";
  }
}

const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "bg-primary",
  "Direct": "bg-blue-500",
  "Referral": "bg-violet-500",
  "Organic Social": "bg-pink-500",
  "Email": "bg-amber-500",
  "Paid Search": "bg-orange-500",
  "Organic Video": "bg-red-500",
};
export function channelColor(name: string) {
  return CHANNEL_COLORS[name] ?? "bg-slate-400";
}
