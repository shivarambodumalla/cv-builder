import type { SeriesTone } from "./types";

/**
 * Mark colours per tone, checked with the dataviz palette validator against
 * the card surface (#ece5d8): primary, secondary and accent pass the
 * lightness band, colour-blind separation (worst ΔE 11.1) and the
 * normal-vision floor (worst ΔE 15.8) for any pairing, and all clear 3:1.
 *
 * - primary: the theme teal token.
 * - secondary: a chart step of the brand navy. #1E3A5F itself is too dark for
 *   a mark (it reads as text ink and fails the lightness band).
 * - accent: the amber the career path section already uses for highlights.
 * - success / warning / error: the status tokens, only for series that mean
 *   good or bad, never as "series four".
 * - muted: warm grey for "Other" and de-emphasised series (3.1:1 on the card).
 *
 * Text never wears these: labels and values stay in foreground / muted ink.
 */
export const TONE_COLOR: Record<SeriesTone, string> = {
  primary: "var(--primary)",
  secondary: "#34529a",
  accent: "#b45309",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  muted: "#8c7f6e",
};

/** Fixed order for parts that arrive without a tone. Never cycled. */
export const CATEGORICAL_ORDER: SeriesTone[] = ["primary", "secondary", "accent"];
