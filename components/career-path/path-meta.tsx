import { cn } from "@/lib/utils";
import {
  MOVE_TYPE_LABELS,
  type MoveType,
  type RoleMarket,
} from "@/lib/career-path/types";
import { formatJobCount, formatSalaryRange } from "./format";
import type { CSSProperties } from "react";
import { CP, HUE_CLASSES, MOVE_CLASSES, MOVE_HUE, type Hue } from "./palette";

// Shared pieces of the career path look, used by the tool, the plan page and
// the example card: a colored uppercase eyebrow for the move type, a big serif
// fit number over a thin bar, pill chips for skills and a two-up market stat row.
// Colours come from ./palette: the move type's hue (green step up, navy
// sideways, amber career change) and navy for figures.

/** Button looks for the career path section. */
export const CP_BUTTON = {
  dark: "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#0C1A0E] px-5 text-sm font-semibold text-[#F7F5F0] transition-colors duration-150 hover:bg-[#1F3323] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#065F46] focus-visible:ring-offset-2",
  outline:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#0C1A0E] bg-white px-5 text-sm font-semibold text-[#0C1A0E] transition-colors duration-150 hover:bg-[#F0EDE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#065F46] focus-visible:ring-offset-2",
  green:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#065F46] px-5 text-[15px] font-semibold text-[#F7F5F0] transition-colors duration-150 hover:bg-[#044536] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#065F46] focus-visible:ring-offset-2",
  navyOutline:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#1E3A5F] bg-white px-5 text-sm font-semibold text-[#1E3A5F] transition-colors duration-150 hover:bg-[#E8EEF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2",
} as const;

/** Section eyebrow: small, bold, spaced uppercase. Green for the tool and actions. */
export const CP_EYEBROW =
  "text-xs font-bold uppercase tracking-[0.14em] text-[#065F46]";
/** Eyebrow for data sections (job counts, pay, tables). */
export const CP_EYEBROW_NAVY =
  "text-xs font-bold uppercase tracking-[0.14em] text-[#1E3A5F]";
/** Eyebrow for callouts and highlights. */
export const CP_EYEBROW_AMBER =
  "text-xs font-bold uppercase tracking-[0.14em] text-[#8A5A0B]";

/** White card with the section's warm border. */
export const CP_CARD =
  "rounded-[20px] border border-[#E0D8CC] bg-white shadow-[0_1px_2px_rgba(12,26,14,0.04)]";

/**
 * A 3px top edge on a CP_CARD in one hue. The colour is an inline style: a
 * `border-[hex]` class would replace the card's warm border on every side.
 */
// A 3px bar drawn inside the card (not a thick top border, which bends around
// the rounded corners). Colour comes from the --cp-edge variable set by topEdgeStyle.
export const CP_TOP_EDGE =
  "relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[var(--cp-edge)] before:content-['']";
export function topEdgeStyle(hue: Hue): CSSProperties {
  return {
    "--cp-edge": hue === "amber" ? CP.amber.fill : CP[hue].text,
  } as CSSProperties;
}
export function moveTopEdgeStyle(moveType: MoveType): CSSProperties {
  return topEdgeStyle(MOVE_HUE[moveType]);
}

/** "STEP UP", "SIDEWAYS MOVE", "CAREER CHANGE", each in its own color. `extra` appends " · Best fit". */
export function MoveTypeEyebrow({
  moveType,
  extra,
  className,
}: {
  moveType: MoveType;
  extra?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block text-[11px] font-bold uppercase leading-tight tracking-[0.12em]",
        MOVE_CLASSES[moveType].text,
        className,
      )}
    >
      {MOVE_TYPE_LABELS[moveType]}
      {extra ? ` · ${extra}` : ""}
    </span>
  );
}

function clampFit(fit: number): number {
  return Math.max(0, Math.min(100, Math.round(fit)));
}

/** Big serif "85%" with a small "fit" under it, in the move type's hue (green when none is given). */
export function FitNumber({
  fit,
  moveType = "step_up",
  size = "lg",
  className,
}: {
  fit: number;
  moveType?: MoveType;
  size?: "md" | "lg";
  className?: string;
}) {
  const value = clampFit(fit);
  return (
    <span className={cn("flex shrink-0 flex-col items-end", className)}>
      {/* Body font, bold: the display serif has one light weight and reads thin at this size. */}
      <span
        className={cn(
          "font-bold tabular-nums tracking-[-0.02em]",
          MOVE_CLASSES[moveType].text,
          size === "lg" ? "text-[30px] md:text-[34px]" : "text-[26px]",
          // After the size: tailwind-merge drops a leading-* that comes before a text-size.
          "leading-none",
        )}
      >
        {value}
        <span
          className={cn(
            "font-semibold",
            size === "lg" ? "text-[15px] md:text-[17px]" : "text-[14px]",
          )}
        >
          %
        </span>
      </span>
      <span className="text-[11px] text-[#5F5852] md:text-xs">fit</span>
    </span>
  );
}

/** Thin fit bar in the move type's hue. Decorative: the number next to it carries the meaning. */
export function FitBar({
  fit,
  moveType = "step_up",
  className,
}: {
  fit: number;
  moveType?: MoveType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-[3px] bg-[#EDE8DF]",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn("h-full rounded-[3px]", MOVE_CLASSES[moveType].bar)}
        style={{ width: `${clampFit(fit)}%` }}
      />
    </div>
  );
}

const CHIP =
  "inline-flex items-center rounded-full bg-[#F0EDE6] px-2.5 py-[5px] text-xs leading-tight text-[#3F3A35]";

/**
 * Pill chips for skills. `max` shows the first few plus "+N more"; `mobileMax`
 * shows fewer on phones (the rest appear from md up).
 */
export function SkillChips({
  skills,
  label,
  max,
  mobileMax,
}: {
  skills: string[];
  label: string;
  max?: number;
  mobileMax?: number;
}) {
  if (skills.length === 0) return null;
  const desktopCount = max ?? skills.length;
  const phoneCount = Math.min(mobileMax ?? desktopCount, desktopCount);
  const shown = skills.slice(0, desktopCount);
  const moreDesktop = skills.length - desktopCount;
  const morePhone = skills.length - phoneCount;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {shown.map((s, i) => (
        <li
          key={s}
          className={cn(CHIP, i >= phoneCount && "hidden md:inline-flex")}
        >
          {s}
        </li>
      ))}
      {morePhone > 0 && morePhone !== moreDesktop && (
        <li className={cn(CHIP, "md:hidden")}>+{morePhone} more</li>
      )}
      {moreDesktop > 0 && (
        <li
          className={cn(
            CHIP,
            morePhone !== moreDesktop && "hidden md:inline-flex",
          )}
        >
          +{moreDesktop} more
        </li>
      )}
    </ul>
  );
}

/** "364 / open jobs, US" and "$105K-$145K / advertised", figures in navy. Renders nothing when neither number is known. */
export function MarketStats({
  market,
  className,
}: {
  market: RoleMarket | null;
  className?: string;
}) {
  if (!market) return null;
  const jobs = formatJobCount(market);
  const pay = formatSalaryRange(market);
  if (!jobs && !pay) return null;
  const code = market.country.toUpperCase();
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-3 border-t border-[#EDE8DF] pt-4",
        className,
      )}
    >
      {jobs && (
        <div className="flex flex-col-reverse gap-0.5">
          <dt className="text-xs text-[#5F5852]">open jobs, {code}</dt>
          <dd
            className={cn(
              "text-xl font-semibold tabular-nums md:text-[22px]",
              HUE_CLASSES.navy.text,
            )}
          >
            {jobs}
          </dd>
        </div>
      )}
      {pay && (
        <div className="flex flex-col-reverse gap-0.5">
          <dt className="text-xs text-[#5F5852]">advertised pay</dt>
          <dd
            className={cn(
              "whitespace-nowrap text-xl font-semibold tabular-nums md:text-[22px]",
              HUE_CLASSES.navy.text,
            )}
          >
            {pay}
          </dd>
        </div>
      )}
    </dl>
  );
}
