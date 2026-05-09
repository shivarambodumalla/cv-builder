export const REVIEW_TIERS = {
  starter: {
    name: 'Quick Fix',
    price: 9,
    edit_rounds: 2,
    label: 'For one job application',
    features: [
      'Human expert review',
      '2 edit rounds',
      '24hr turnaround',
      'ATS optimised CV',
    ],
  },
  standard: {
    name: 'Job Hunter',
    price: 17,
    edit_rounds: 5,
    label: 'For active job seekers',
    badge: 'Most popular',
    features: [
      'Full CV rewrite',
      '5 edit rounds',
      'ATS optimisation report',
      'Multi-role targeting',
      'Template improvements',
    ],
  },
  pro: {
    name: 'Career Upgrade',
    price: 35,
    edit_rounds: 999,
    label: 'For career switch / senior roles',
    features: [
      'Unlimited edits',
      'Priority turnaround',
      'Personal career advice',
      'Advanced ATS optimisation',
    ],
  },
} as const;

export type ReviewTier = keyof typeof REVIEW_TIERS;
