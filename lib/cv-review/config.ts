export const REVIEW_TIERS = {
  starter: {
    name: 'Starter',
    price: 14,
    edit_rounds: 2,
    label: 'Great for a quick polish',
    features: [
      'AI + expert review',
      '2 edit rounds',
      '24hr turnaround',
      'PDF download',
    ],
  },
  standard: {
    name: 'Standard',
    price: 29,
    edit_rounds: 5,
    label: 'Most popular',
    badge: 'Most popular',
    features: [
      'AI + expert review',
      '5 edit rounds',
      '24hr turnaround',
      'PDF download',
      'Template recommendations',
      'ATS optimisation report',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    edit_rounds: 999,
    label: 'Best value',
    badge: 'Best value',
    features: [
      'AI + expert review',
      'Unlimited edit rounds',
      'Priority 24hr turnaround',
      'PDF download',
      'Template recommendations',
      'ATS optimisation report',
      'Personal career advice',
    ],
  },
} as const;

export type ReviewTier = keyof typeof REVIEW_TIERS;
