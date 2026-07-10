// Lead scoring per PRD table
export const LEAD_SCORING = {
  visited: 5,
  viewed_curriculum: 20,
  downloaded_pdf: 30,
  viewed_pricing: 20,
  faq: 10,
  booked_call: 40,
} as const;

export type ScoringEvent = keyof typeof LEAD_SCORING;

export function getScore(event: ScoringEvent): number {
  return LEAD_SCORING[event] ?? 0;
}

export function isHotLead(totalScore: number): boolean {
  return totalScore >= 100;
}
