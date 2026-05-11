export const REVIEW_TIERS = {
  starter: {
    name: "Resume Review",
    price: 5,
    original_price: 15,
    discount_pct: 67,
    edit_rounds: 2,
    label: "Quick audit before you apply",
    features: [
      "Quick ATS review",
      "Formatting fixes",
      "1–2 revisions included",
    ],
  },
  standard: {
    name: "Professional Rewrite",
    price: 9,
    original_price: 29,
    discount_pct: 69,
    edit_rounds: 5,
    label: "Full rewrite by a hiring specialist",
    badge: "Most Popular",
    features: [
      "Full resume improvement across every section",
      "Better bullet points with impact",
      "ATS optimization",
      "80+ ATS score guarantee",
      "3–5 revisions included",
      "PDF + Word export",
    ],
  },
  pro: {
    name: "Executive Package",
    price: 25,
    original_price: 75,
    discount_pct: 67,
    edit_rounds: 999,
    label: "Full resume transformation",
    features: [
      "Everything in Professional Rewrite",
      "Full resume transformation",
      "Unlimited revisions",
      "Priority support",
    ],
  },
} as const;

export type ReviewTier = keyof typeof REVIEW_TIERS;
