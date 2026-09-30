import { cn } from "@/lib/utils";
import { MOVE_TYPE_LABELS, type MoveType } from "@/lib/career-path/types";

// Visual pieces for /career-path/<slug>, in the career path section's editorial
// language: Instrument Serif headings (font-cp-display), green uppercase
// eyebrows, white cards on the beige page, pill chips. Colors are fixed hex
// values because this section is light only and theme opacity modifiers don't
// render here.

/** Small green uppercase label above a heading. */
export const EYEBROW = "text-xs font-bold uppercase tracking-[0.14em] text-[#065F46]";

/** Grey uppercase label for data headings inside cards and tables. */
export const LABEL = "text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F5852]";

/** Serif section heading. */
export const SECTION_HEADING =
  "font-cp-display text-[34px] font-normal leading-[1.08] tracking-[-0.01em] text-[#0C1A0E] sm:text-[40px]";

/** White card on the beige page. */
export const CARD =
  "rounded-[20px] border border-[#E0D8CC] bg-white shadow-[0_1px_2px_rgba(12,26,14,0.04)]";

/** Green text link. */
export const LINK =
  "font-semibold text-[#065F46] underline-offset-4 transition-colors duration-150 hover:text-[#044536] hover:underline";

// Step up is the brand green, sideways is amber, a career change is navy.
const MOVE_TONE: Record<MoveType, string> = {
  step_up: "text-[#065F46]",
  lateral: "text-[#8A5A0B]",
  pivot: "text-[#1E3A5F]",
};

export function MoveTypeEyebrow({ moveType, className }: { moveType: MoveType; className?: string }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em]",
        MOVE_TONE[moveType],
        className
      )}
    >
      {MOVE_TYPE_LABELS[moveType]}
    </span>
  );
}

export function SkillChips({ skills, label }: { skills: string[]; label: string }) {
  if (skills.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {skills.map((s) => (
        <li key={s} className="rounded-full bg-[#F0EDE6] px-2.5 py-[5px] text-[13px] leading-snug text-[#3F3A35]">
          {s}
        </li>
      ))}
    </ul>
  );
}
