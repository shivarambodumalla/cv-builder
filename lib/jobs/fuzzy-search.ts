// Fuzzy search helpers for job role and location autocomplete + typo correction

export const COMMON_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "DevOps Engineer", "Data Scientist", "Data Engineer", "Data Analyst",
  "Machine Learning Engineer", "ML Engineer", "AI Engineer",
  "Product Manager", "Project Manager", "Program Manager",
  "UX Designer", "UI Designer", "Product Designer", "Graphic Designer",
  "Marketing Manager", "Digital Marketing", "Growth Manager", "Content Writer",
  "Business Analyst", "Business Development", "Sales Manager", "Account Manager",
  "HR Manager", "Recruiter", "People Operations",
  "Finance Manager", "Accountant", "Financial Analyst",
  "QA Engineer", "Test Engineer", "SDET",
  "iOS Developer", "Android Developer", "Mobile Developer",
  "Cloud Engineer", "Platform Engineer", "SRE", "Site Reliability Engineer",
  "Security Engineer", "Cybersecurity Analyst",
  "Solutions Architect", "Technical Architect", "Enterprise Architect",
  "Engineering Manager", "Tech Lead", "CTO", "VP Engineering",
  "Scrum Master", "Agile Coach",
  "Customer Success", "Support Engineer", "Technical Writer",
];

export const COMMON_LOCATIONS = [
  // India
  "Bengaluru", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai",
  "Kolkata", "Ahmedabad", "Noida", "Gurgaon", "Gurugram",
  // US
  "New York", "San Francisco", "Los Angeles", "Seattle", "Austin", "Boston",
  "Chicago", "Denver", "Atlanta", "Dallas", "Houston", "Miami",
  "San Jose", "San Diego", "Washington DC", "Portland", "Raleigh",
  // UK
  "London", "Manchester", "Birmingham", "Edinburgh", "Bristol", "Leeds", "Glasgow",
  // Europe
  "Berlin", "Munich", "Amsterdam", "Dublin", "Paris", "Barcelona", "Stockholm", "Zurich",
  // Asia Pacific
  "Singapore", "Sydney", "Melbourne", "Toronto", "Vancouver", "Dubai", "Tokyo",
  // Remote
  "Remote", "Work from Home", "Anywhere",
];

/** Simple Levenshtein distance */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Find closest match from a list. Returns null if nothing is close enough. */
export function findClosestMatch(input: string, list: string[], maxDistance = 3): string | null {
  if (!input.trim()) return null;
  const lower = input.toLowerCase().trim();

  // Exact match (case-insensitive)
  const exact = list.find(item => item.toLowerCase() === lower);
  if (exact) return exact;

  // Prefix match
  const prefix = list.find(item => item.toLowerCase().startsWith(lower));
  if (prefix) return prefix;

  // Contains match
  const contains = list.find(item => item.toLowerCase().includes(lower));
  if (contains) return contains;

  // Fuzzy match
  let bestMatch: string | null = null;
  let bestDist = maxDistance + 1;

  for (const item of list) {
    const dist = levenshtein(lower, item.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = item;
    }
  }

  return bestDist <= maxDistance ? bestMatch : null;
}

/** Get autocomplete suggestions for a partial input */
export function getSuggestions(input: string, list: string[], limit = 6): string[] {
  if (!input.trim()) return [];
  const lower = input.toLowerCase().trim();

  // Score each item
  const scored = list.map(item => {
    const itemLower = item.toLowerCase();
    let score = 0;
    if (itemLower === lower) score = 100;
    else if (itemLower.startsWith(lower)) score = 80;
    else if (itemLower.includes(lower)) score = 60;
    else {
      const dist = levenshtein(lower, itemLower);
      if (dist <= 3) score = 40 - dist * 10;
    }
    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.item);
}

/** Correct a role search term if it looks like a typo */
export function correctRole(input: string): string {
  const match = findClosestMatch(input, COMMON_ROLES, 3);
  return match || input;
}

/** Correct a location search term if it looks like a typo */
export function correctLocation(input: string): string {
  const match = findClosestMatch(input, COMMON_LOCATIONS, 3);
  return match || input;
}
