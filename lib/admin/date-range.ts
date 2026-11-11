/**
 * One date-range model for every admin dashboard. Days are UTC (storage is
 * UTC), the range lives in the URL (?range=30d or ?range=custom&from=&to=) so
 * a link shows the same numbers to whoever opens it, and "7d" means the last
 * 7 days including today.
 */

export type RangePreset = "today" | "yesterday" | "7d" | "30d" | "mtd" | "60d" | "90d" | "365d" | "custom";

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "7 days",
  "30d": "30 days",
  mtd: "Month to date",
  "60d": "60 days",
  "90d": "90 days",
  "365d": "1 year",
  custom: "Custom",
};

/** The presets every admin picker offers, in display order. */
export const ADMIN_PRESETS: RangePreset[] = ["today", "yesterday", "7d", "30d", "mtd", "60d", "90d", "365d", "custom"];

/** Default range across the admin: the current calendar month so far. */
export const DEFAULT_PRESET = "mtd" as const;

export interface ResolvedRange {
  preset: RangePreset;
  /** Inclusive, YYYY-MM-DD (UTC). */
  from: string;
  to: string;
  /** from at 00:00:00.000Z and to at 23:59:59.999Z, for timestamp columns. */
  fromIso: string;
  toIso: string;
  days: number;
}

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(day: string, n: number): string {
  return isoDay(new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS));
}

export function rangeFromDays(from: string, to: string, preset: RangePreset = "custom"): ResolvedRange {
  const [a, b] = from <= to ? [from, to] : [to, from];
  return {
    preset,
    from: a,
    to: b,
    fromIso: `${a}T00:00:00.000Z`,
    toIso: `${b}T23:59:59.999Z`,
    days: Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS) + 1,
  };
}

export function presetRange(preset: Exclude<RangePreset, "custom">, now: Date = new Date()): ResolvedRange {
  const today = isoDay(now);
  switch (preset) {
    case "today":
      return rangeFromDays(today, today, preset);
    case "yesterday": {
      const y = addDays(today, -1);
      return rangeFromDays(y, y, preset);
    }
    case "7d":
      return rangeFromDays(addDays(today, -6), today, preset);
    case "30d":
      return rangeFromDays(addDays(today, -29), today, preset);
    case "mtd":
      return rangeFromDays(`${today.slice(0, 8)}01`, today, preset);
    case "60d":
      return rangeFromDays(addDays(today, -59), today, preset);
    case "90d":
      return rangeFromDays(addDays(today, -89), today, preset);
    case "365d":
      return rangeFromDays(addDays(today, -364), today, preset);
  }
}

/**
 * Reads ?range / ?from / ?to (from a page's searchParams or a URLSearchParams).
 * Anything missing or malformed falls back to `fallback`.
 */
export function resolveRange(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  fallback: Exclude<RangePreset, "custom"> = DEFAULT_PRESET,
  now: Date = new Date(),
): ResolvedRange {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const range = get("range") as RangePreset | undefined;
  if (range === "custom") {
    const from = get("from");
    const to = get("to");
    if (from && to && DATE_RE.test(from) && DATE_RE.test(to)) return rangeFromDays(from, to, "custom");
  }
  if (range && range !== "custom" && range in RANGE_LABELS) return presetRange(range, now);
  return presetRange(fallback, now);
}

/** The same number of days immediately before `r`, for "vs previous period". */
export function previousRange(r: ResolvedRange): ResolvedRange {
  return rangeFromDays(addDays(r.from, -r.days), addDays(r.from, -1));
}

/** The same days one week earlier, e.g. today vs the same weekday last week. */
export function weekEarlier(r: ResolvedRange): ResolvedRange {
  return rangeFromDays(addDays(r.from, -7), addDays(r.to, -7));
}

/** Query string for a range, for links and API calls. */
export function rangeQuery(r: ResolvedRange): string {
  return r.preset === "custom" ? `range=custom&from=${r.from}&to=${r.to}` : `range=${r.preset}`;
}

/** Every UTC day in the range, oldest first, for chart spines. */
export function daysIn(r: ResolvedRange): string[] {
  return Array.from({ length: r.days }, (_, i) => addDays(r.from, i));
}

/** "vs last Wed" / "vs prior 7 days" wording for a comparison. */
export function comparisonLabel(r: ResolvedRange, against: "week" | "previous"): string {
  if (against === "week" && r.days === 1) {
    const weekday = new Date(`${r.from}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    return `vs last ${weekday}`;
  }
  return r.days === 1 ? "vs day before" : `vs prior ${r.days} days`;
}

export type Bucket = "day" | "week" | "month";

/** Chart granularity for a range: daily up to 62 days, weekly up to 180, then monthly. */
export function bucketFor(r: ResolvedRange): Bucket {
  if (r.days <= 62) return "day";
  if (r.days <= 180) return "week";
  return "month";
}

/** Start day (YYYY-MM-DD) of the bucket a day falls in. Weeks start Monday. */
export function bucketStart(day: string, bucket: Bucket): string {
  if (bucket === "day") return day;
  if (bucket === "month") return `${day.slice(0, 8)}01`;
  const d = new Date(`${day}T00:00:00Z`);
  const offset = (d.getUTCDay() + 6) % 7;
  return addDays(day, -offset);
}

/** Every bucket in the range, oldest first, with a short axis label. */
export function bucketsIn(r: ResolvedRange, bucket: Bucket = bucketFor(r)): { key: string; label: string }[] {
  const seen = new Set<string>();
  const out: { key: string; label: string }[] = [];
  for (const day of daysIn(r)) {
    const key = bucketStart(day, bucket);
    if (seen.has(key)) continue;
    seen.add(key);
    const d = new Date(`${key}T00:00:00Z`);
    const label =
      bucket === "month"
        ? d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    out.push({ key, label });
  }
  return out;
}
