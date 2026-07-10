// Lead scoring v2 (vision doc): every action increases intent score
export const LEAD_SCORING = {
  visited: 5,
  viewed_pricing: 15,
  viewed_curriculum: 20,
  downloaded_pdf: 20,
  booked_call: 50,
  returning_visitor: 10,
} as const;

export type ScoringEvent = keyof typeof LEAD_SCORING;

export function getScore(event: string): number {
  return LEAD_SCORING[event as ScoringEvent] ?? 0;
}

export function isHotLead(totalScore: number): boolean {
  return totalScore >= 100;
}
