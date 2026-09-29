import type { CareerMove, RoleCareerPath } from "@/lib/roles/career-moves";
import { article } from "@/lib/roles/career-moves/pages";
import type { MoveType } from "@/lib/career-path/types";

// Copy built from the hand-written career moves for /career-path/<slug>.
// Kept out of the page module so a script can check every role's sentences.

/** "Analytics Engineer" -> "analytics engineer". Acronyms and mixed-case words (IAM, MLOps, AR/VR, CoE) keep their case. */
export function roleNoun(title: string): string {
  return title
    .split(" ")
    .map((w) => (/^[A-Z][a-z]+$/.test(w) ? w.toLowerCase() : w))
    .join(" ");
}

/** "Data Analyst" -> "Data analyst", "IAM Engineer" -> "IAM engineer". */
export function sentenceCase(title: string): string {
  const s = roleNoun(title);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function plural(title: string): string {
  return `${roleNoun(title)}s`;
}

/** Anchor id for a move's section on the page. */
export function moveAnchor(move: CareerMove): string {
  return `move-${move.toRole.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/** The part of typicalTiming before the first comma or full stop: "After 1-3 years". */
export function timingShort(move: CareerMove): string {
  return move.typicalTiming.split(/,|\.\s/)[0].replace(/\.$/, "").trim();
}

/** Timing as the end of a sentence: "usually after 1-3 years", "and you can make it any time after 2 years". */
function timingClause(move: CareerMove, brief = false): string {
  const full = timingShort(move);
  // "After 2-3 years as a senior PM with an AI product surface that..." -> "After 2-3 years".
  const n = "(?:\\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)";
  const years = new RegExp(`^(?:any time after |after |usually )?(?:about )?${n}(?:(?:-| to | or )${n})?(?: or more)? years?(?: in\\b)?`, "i").exec(full)?.[0];
  // Only trim when the rest still reads as a point in time ("after 5 years", "5 years in").
  const complete = years !== undefined && /^(any time after|after)\b|\bin$/i.test(years.replace(/^usually /i, ""));
  const short = brief && complete ? years : full;
  const lower = short.charAt(0).toLowerCase() + short.slice(1);
  if (/^any time/i.test(short)) return `and you can make it ${lower}`;
  if (/^usually /i.test(short)) return lower;
  return `usually ${lower}`;
}

function joinList(items: string[], conjunction: "or" | "and"): string {
  if (items.length <= 2) return items.join(` ${conjunction} `);
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

const orList = (items: string[]) => joinList(items, "or");

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

const MAX_WORDS = 25;

/**
 * Two or three sentences answering "What comes after <role>?", for the top of
 * the page and for answer engines to quote. The first sentence stands on its
 * own: the lead move (first in the hand-written list) and when people make it.
 * The rest names the other destinations by move type.
 */
export function shortAnswer(label: string, path: RoleCareerPath): string[] {
  const [lead, ...rest] = path.moves;
  if (!lead) return [];
  const a = article(label);
  const opening = (brief: boolean) =>
    `A common next step for ${a} ${roleNoun(label)} is ${roleNoun(lead.toRole)}, ${timingClause(lead, brief)}.`;
  // The quotable sentence: keep it near 20 words by trimming the timing detail.
  const first = wordCount(opening(false)) <= 20 ? opening(false) : opening(true);

  const byType = (type: MoveType) => rest.filter((m) => m.moveType === type).map((m) => roleNoun(m.toRole));
  const up = byType("step_up");
  const side = byType("lateral");
  const change = byType("pivot");

  const parts = [
    up.length > 0 && `a step up to ${orList(up)}`,
    side.length > 0 && `a sideways move to ${orList(side)}`,
    change.length > 0 && `a career change to ${orList(change)}`,
  ].filter((p): p is string => Boolean(p));
  if (parts.length === 0) return [first];

  const combined = `Other routes are ${joinList(parts, "and")}.`;
  if (wordCount(combined) <= MAX_WORDS) return [first, combined];

  // Too long as one sentence: shorter sentences instead, still at most three in all.
  const upText = up.length > 0 ? `step up to ${orList(up)}` : null;
  const sideText = side.length > 0 ? `move sideways to ${orList(side)}` : null;
  const moves = [upText, sideText].filter((p): p is string => p !== null);
  const both = `You can also ${moves.join(", or ")}.`;
  const split = [
    ...(wordCount(both) <= MAX_WORDS ? [both] : moves.map((m) => `You can also ${m}.`)),
    ...(change.length > 0
      ? [`Some change careers and become ${orList(change.map((r) => `${article(r)} ${r}`))}.`]
      : []),
  ];
  return [first, ...split];
}
