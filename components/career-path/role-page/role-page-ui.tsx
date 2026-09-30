import { cn } from "@/lib/utils";
import { MOVE_TYPE_LABELS, type MoveType } from "@/lib/career-path/types";
import {
  HUE_CLASSES,
  MOVE_CLASSES,
  type Hue,
} from "@/components/career-path/palette";

// Visual pieces for /career-path/<slug>, in the career path section's editorial
// language: bold Geist display headings (font-cp-display), uppercase eyebrows in
// the hue of the section's job (palette.ts: green for actions, navy for data,
// amber for callouts), white cards on the beige page, pill chips. Colors are
// fixed hex values because this section is light only and theme opacity
// modifiers don't render here.

const EYEBROW_BASE = "text-xs font-bold uppercase tracking-[0.14em]";

/** Small green uppercase label above a heading: actions and the tool. */
export const EYEBROW = cn(EYEBROW_BASE, HUE_CLASSES.green.text);

/** Navy eyebrow for data sections. */
export const EYEBROW_NAVY = cn(EYEBROW_BASE, HUE_CLASSES.navy.text);

/** Amber eyebrow for callouts. */
export const EYEBROW_AMBER = cn(EYEBROW_BASE, HUE_CLASSES.amber.text);

/** Grey uppercase label for data headings inside cards and tables. */
export const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F5852]";

/** Serif section heading. */
export const SECTION_HEADING =
  "font-cp-display text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-[#0C1A0E] sm:text-[36px]";

/** White card on the beige page. */
export const CARD =
  "rounded-[20px] border border-[#E0D8CC] bg-white shadow-[0_1px_2px_rgba(12,26,14,0.04)]";

/** Green text link. */
export const LINK =
  "font-semibold text-[#065F46] underline-offset-4 transition-colors duration-150 hover:text-[#044536] hover:underline";

/** Small filled square in a hue, for a legend beside a text label. */
export function HueSwatch({
  hue,
  className,
}: {
  hue: Hue;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-[2px]",
        HUE_CLASSES[hue].bar,
        className,
      )}
    />
  );
}

/** Move type as a coloured label with its square: step up green, sideways navy, career change amber (MOVE_CLASSES). */
export function MoveTypeEyebrow({
  moveType,
  className,
}: {
  moveType: MoveType;
  className?: string;
}) {
  const tone = MOVE_CLASSES[moveType];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em]",
        tone.text,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("inline-block h-2 w-2 shrink-0 rounded-[2px]", tone.bar)}
      />
      {MOVE_TYPE_LABELS[moveType]}
    </span>
  );
}

export function SkillChips({
  skills,
  label,
}: {
  skills: string[];
  label: string;
}) {
  if (skills.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {skills.map((s) => (
        <li
          key={s}
          className="rounded-full bg-[#F0EDE6] px-2.5 py-[5px] text-[13px] leading-snug text-[#3F3A35]"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}
