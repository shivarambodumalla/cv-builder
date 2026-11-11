// Derived facts shown on a review card. Each one is read from the author's
// account or role, never typed per review, so a card can't claim more than
// the author actually did.

export const REVIEW_FIELDS = ["Engineering", "Data and AI", "Product", "Operations", "Students", "Other"] as const;
export type ReviewField = (typeof REVIEW_FIELDS)[number];

// First match wins, so the narrower groups come first ("Data Engineer" is Data
// and AI, "Software Engineering Intern" is Students).
const FIELD_RULES: [ReviewField, RegExp][] = [
  ["Students", /\b(student|estudiante|undergraduate|intern|graduate|fresher|trainee)\b/i],
  ["Data and AI", /\b(data|machine learning|ml|ai|scientist|analytics|bi)\b/i],
  ["Engineering", /\b(engineer|engineering|developer|development|programmer|devops|sre|architect|qa|tester|software|technical|tech|full[ -]?stack|back[ -]?end|front[ -]?end|sap)\b/i],
  ["Product", /\b(product|project|program|scrum|agile|analyst|ux|ui|designer|owner)\b/i],
  ["Operations", /\b(operations|operator|customer|sales|marketing|finance|accountant|cashier|recouvrement|hr|recruit|admin|administrative|secretary|coordinator|producer|teacher|support|account|logistics|supply|manager)\b/i],
];

export function reviewField(role: string): ReviewField {
  return FIELD_RULES.find(([, re]) => re.test(role))?.[0] ?? "Other";
}

export type UsedFeature = "ATS scan" | "Resume builder";

/** The strongest thing the author is known to have used. Free users can't reach Pro tools, so none are claimed. */
export function usedFeature({ atsScans }: { atsScans: number }): UsedFeature {
  return atsScans > 0 ? "ATS scan" : "Resume builder";
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** "US" → "United States". Null for a missing or unknown code. */
export function countryName(code: string | null | undefined): string | null {
  if (!code || !/^[A-Z]{2}$/i.test(code)) return null;
  try {
    const name = regionNames.of(code.toUpperCase());
    return name && name !== code.toUpperCase() ? name : null;
  } catch {
    return null;
  }
}
