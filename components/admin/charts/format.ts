import type { ValueFormat } from "./types";

const PLAIN = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12.3k, but 123k rather than 123.4k. */
function compact(n: number, divisor: number, suffix: string): string {
  const scaled = n / divisor;
  const digits = Math.abs(scaled) < 100 ? 1 : 0;
  return `${scaled.toFixed(digits).replace(/\.0$/, "")}${suffix}`;
}

/**
 * One way to print a value everywhere in the admin charts.
 * - number: 1,234 below 10k, then 12.3k / 4.5M
 * - usd: $1,234, with cents under $100 ($12.50)
 * - percent: 12.3% (the value is already 0–100)
 */
export function formatValue(n: number, format: ValueFormat = "number"): string {
  if (!Number.isFinite(n)) return "–";
  if (format === "usd") return Math.abs(n) < 100 ? USD_CENTS.format(n) : USD_WHOLE.format(n);
  if (format === "percent") return `${n.toFixed(1).replace(/\.0$/, "")}%`;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return compact(n, 1_000_000, "M");
  if (abs >= 10_000) return compact(n, 1_000, "k");
  return PLAIN.format(n);
}

/** Axis tick text: formatValue, minus cents on whole-dollar ticks ($0, $50). */
export function formatTick(n: number, format: ValueFormat = "number"): string {
  if (format === "usd" && Number.isInteger(n)) {
    return Math.abs(n) >= 10_000 ? `$${compact(n, 1_000, "k")}` : USD_WHOLE.format(n);
  }
  return formatValue(n, format);
}

/** Share of a whole as "12.3%", or "–" when the whole is 0. */
export function formatShare(part: number, whole: number): string {
  return whole > 0 ? formatValue((part / whole) * 100, "percent") : "–";
}
