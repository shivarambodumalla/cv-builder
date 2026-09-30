import type { MoveType } from "@/lib/career-path/types";

// The career path section's palette. Three hues, each with one job, on warm
// neutrals. Colour never carries meaning alone: every coloured move type keeps
// its text label.
//
//   green  = actions and "step up"          (brand green, CLAUDE.md)
//   navy   = data and "sideways move"       (secondary brand navy)
//   amber  = highlights and "career change" (tertiary, this section only)
//
// Tailwind classes here are literal so the JIT can see them. Text-on-tint pairs
// meet 4.5:1: #065F46 / #1E3A5F / #8A5A0B on their tints and on white.

export const CP = {
  ink: "#0C1A0E",
  body: "#4A443E",
  muted: "#5F5852",
  faint: "#78716C",
  border: "#E0D8CC",
  divider: "#EDE8DF",
  chip: "#F0EDE6",
  cream: "#F7F5F0",
  green: {
    text: "#065F46",
    hover: "#044536",
    tint: "#E6F2EC",
    tintBorder: "#CFE5D9",
    soft: "#8FD3B5",
  },
  navy: {
    text: "#1E3A5F",
    hover: "#162C48",
    tint: "#E8EEF5",
    tintBorder: "#CBD6E4",
    soft: "#8FA9C9",
  },
  amber: {
    text: "#8A5A0B",
    fill: "#B45309",
    tint: "#FBF0DC",
    tintBorder: "#EBD4A6",
    soft: "#E3B76A",
  },
} as const;

export type Hue = "green" | "navy" | "amber";

export const MOVE_HUE: Record<MoveType, Hue> = {
  step_up: "green",
  lateral: "navy",
  pivot: "amber",
};

/** Ready-made class sets per hue. Use `MOVE_CLASSES[MOVE_HUE[moveType]]`. */
export const HUE_CLASSES: Record<
  Hue,
  {
    text: string;
    bg: string;
    tint: string;
    tintBorder: string;
    border: string;
    bar: string;
    ring: string;
  }
> = {
  green: {
    text: "text-[#065F46]",
    bg: "bg-[#065F46]",
    tint: "bg-[#E6F2EC]",
    tintBorder: "border-[#CFE5D9]",
    border: "border-[#065F46]",
    bar: "bg-[#065F46]",
    ring: "focus-visible:ring-[#065F46]",
  },
  navy: {
    text: "text-[#1E3A5F]",
    bg: "bg-[#1E3A5F]",
    tint: "bg-[#E8EEF5]",
    tintBorder: "border-[#CBD6E4]",
    border: "border-[#1E3A5F]",
    bar: "bg-[#1E3A5F]",
    ring: "focus-visible:ring-[#1E3A5F]",
  },
  amber: {
    text: "text-[#8A5A0B]",
    bg: "bg-[#B45309]",
    tint: "bg-[#FBF0DC]",
    tintBorder: "border-[#EBD4A6]",
    border: "border-[#B45309]",
    bar: "bg-[#B45309]",
    ring: "focus-visible:ring-[#B45309]",
  },
};

export const MOVE_CLASSES: Record<MoveType, (typeof HUE_CLASSES)[Hue]> = {
  step_up: HUE_CLASSES.green,
  lateral: HUE_CLASSES.navy,
  pivot: HUE_CLASSES.amber,
};

/** Raw hex per move type, for SVG and inline styles. */
export const MOVE_HEX: Record<
  MoveType,
  { text: string; fill: string; soft: string }
> = {
  step_up: { text: CP.green.text, fill: CP.green.text, soft: CP.green.soft },
  lateral: { text: CP.navy.text, fill: CP.navy.text, soft: CP.navy.soft },
  pivot: { text: CP.amber.text, fill: CP.amber.fill, soft: CP.amber.soft },
};

// Fields for the role index, so the 28-link list isn't a wall of identical
// rows. Keyed by ROLE_CATEGORIES name (lib/jobs/role-categories.ts).
export const FIELD_HUE: Record<string, Hue> = {
  "Software Development": "navy",
  "DevOps, Cloud & Infrastructure": "navy",
  "Architecture & Advanced Engineering": "navy",
  "AI, ML & Data": "green",
  "Database & Data Systems": "green",
  "QA & Testing": "green",
  Cybersecurity: "navy",
  "Product, Business & Management": "amber",
  "Design & UX": "amber",
  "AR/VR, Gaming & Emerging Tech": "amber",
};
