import type { RoleMarket } from "@/lib/career-path/types";

const COUNTRY_NAMES: Record<string, string> = {
  us: "the US",
  gb: "the UK",
  ca: "Canada",
  au: "Australia",
  nz: "New Zealand",
  ie: "Ireland",
  in: "India",
  de: "Germany",
  nl: "the Netherlands",
  fr: "France",
  ae: "the UAE",
  sg: "Singapore",
  za: "South Africa",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code.toLowerCase()] ?? code.toUpperCase();
}

function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value / 1000)}K ${currency}`;
  }
}

/** "$95K-$130K advertised", or null when the listings carry too few salaries. */
export function formatSalary(market: RoleMarket): string | null {
  const { salaryLow, salaryHigh, salaryMedian, currency } = market;
  if (salaryLow !== null && salaryHigh !== null && salaryHigh > salaryLow) {
    return `${formatMoney(salaryLow, currency)}-${formatMoney(salaryHigh, currency)} advertised`;
  }
  if (salaryMedian !== null) return `${formatMoney(salaryMedian, currency)} median advertised`;
  return null;
}

export function formatOpenJobs(market: RoleMarket): string {
  if (market.openJobs <= 0) return "No open listings found right now";
  const n = market.openJobs.toLocaleString("en-US");
  return `${n} open ${market.openJobs === 1 ? "job" : "jobs"}`;
}

export function skillsCountLabel(count: number): string {
  if (count <= 0) return "90-day plan";
  return `${count} ${count === 1 ? "skill" : "skills"} to build + 90-day plan`;
}

export function planPath(id: string, role: string): string {
  return `/career-path/plan/${id}?role=${encodeURIComponent(role)}`;
}

export function unlockHref(id: string, role: string, signedIn: boolean): string {
  const plan = planPath(id, role);
  return signedIn ? plan : `/login?returnUrl=${encodeURIComponent(plan)}`;
}
