import type { Tone } from "@/components/admin/stat-tile";

/** count as a percentage of base, one decimal. */
export function p(count: number, base: number): number { return base === 0 ? 0 : Math.round((count / base) * 1000) / 10; }
export function fp(n: number): string { return `${n}%`; }

/** Tone for a conversion rate against "good" and "ok" thresholds. */
export function rateTone(pct: number, good: number, ok: number): Exclude<Tone, "neutral"> {
  return pct >= good ? "success" : pct >= ok ? "warning" : "error";
}

export const TONE_TEXT = { success: "text-success", warning: "text-warning", error: "text-error" } as const;
