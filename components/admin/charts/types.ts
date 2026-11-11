/**
 * Shared chart vocabulary for the admin dashboard. Data arrives already
 * bucketed (one entry per day / week / month) with its label formatted, so the
 * charts never parse dates.
 */

/** Colour role of a series. Status tones are for series that mean good/bad. */
export type SeriesTone = "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "muted";

/** One x-axis position, e.g. { key: "2026-11-03", label: "Nov 3" }. */
export interface ChartBucket {
  key: string;
  label: string;
}

/** One line, area or bar series; `values[i]` belongs to `buckets[i]`. */
export interface ChartSeries {
  name: string;
  values: number[];
  tone: SeriesTone;
  /** Defaults to "line". */
  kind?: "line" | "area" | "bar";
}

/** How values print. "percent" expects 0–100, not a 0–1 ratio. */
export type ValueFormat = "number" | "usd" | "percent";
