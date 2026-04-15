import type { ResumeContent } from "./types";

function parseDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const trimmed = s.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;
  const m = trimmed.match(/^(\d{4})[-/]?(\d{1,2})?$/);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = m[2] ? parseInt(m[2], 10) - 1 : 0;
    return new Date(year, month, 1);
  }
  const y = trimmed.match(/\b(19|20)\d{2}\b/);
  if (y) return new Date(parseInt(y[0], 10), 0, 1);
  return null;
}

export function computeYearsOfExperience(content: ResumeContent | null | undefined): number | null {
  const items = content?.experience?.items ?? [];
  if (items.length === 0) return null;

  let earliest: Date | null = null;
  let latest: Date | null = null;
  const now = new Date();

  for (const item of items) {
    const start = parseDate(item.startDate);
    if (start && (!earliest || start < earliest)) earliest = start;

    const end = item.isCurrent ? now : parseDate(item.endDate) ?? now;
    if (!latest || end > latest) latest = end;
  }

  if (!earliest || !latest) return null;
  const years = (latest.getTime() - earliest.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 0) return 0;
  return Math.round(years * 10) / 10;
}
