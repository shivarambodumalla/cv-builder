import type { RoleMarket } from "@/lib/career-path/types";
import { ALL_ROLES } from "@/lib/jobs/role-categories";

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

/** "$95K-$130K" (or a single median), or null when the listings carry too few salaries. */
export function formatSalaryRange(market: RoleMarket): string | null {
  const { salaryLow, salaryHigh, salaryMedian, currency } = market;
  if (salaryLow !== null && salaryHigh !== null && salaryHigh > salaryLow) {
    return `${formatMoney(salaryLow, currency)}-${formatMoney(salaryHigh, currency)}`;
  }
  if (salaryMedian !== null) return formatMoney(salaryMedian, currency);
  return null;
}

/** "$95K-$130K advertised", or null when the listings carry too few salaries. */
export function formatSalary(market: RoleMarket): string | null {
  const range = formatSalaryRange(market);
  return range && `${range} advertised`;
}

/** "1,240", or null when the count is unknown. */
export function formatJobCount(market: RoleMarket): string | null {
  return market.openJobs > 0 ? market.openJobs.toLocaleString("en-US") : null;
}

export function formatOpenJobs(market: RoleMarket): string {
  if (market.openJobs <= 0) return "No open listings found right now";
  const n = market.openJobs.toLocaleString("en-US");
  return `${n} open ${market.openJobs === 1 ? "job" : "jobs"}`;
}

/** "Sep 29, 2026": when the listings behind a market snapshot were checked. */
export function formatCheckedOn(market: RoleMarket): string | null {
  const d = new Date(market.fetchedAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Where a signed-in user lands to tailor their resume for `role`: claims the run and routes into the resume flow. */
export function continuePath(id: string, role: string): string {
  return `/career-path/continue/${id}?role=${encodeURIComponent(role)}`;
}

/** The primary action: tailor the resume for this role (Google sign-in first when signed out). */
export function tailorHref(
  id: string,
  role: string,
  signedIn: boolean,
): string {
  const next = continuePath(id, role);
  return signedIn ? next : `/login?returnUrl=${encodeURIComponent(next)}`;
}

/** Live listings for a role: its own jobs page when we have one, else a title search. No sign-in needed. */
export function jobsHref(title: string, searchTitles: string[] = []): string {
  const wanted = [title, ...searchTitles].map((t) => t.trim().toLowerCase());
  const match = ALL_ROLES.find((r) => wanted.includes(r.label.toLowerCase()));
  return match ? `/jobs/${match.slug}` : `/jobs?q=${encodeURIComponent(title)}`;
}

export function planPath(id: string, role: string): string {
  return `/career-path/plan/${id}?role=${encodeURIComponent(role)}`;
}

export function unlockHref(
  id: string,
  role: string,
  signedIn: boolean,
): string {
  const plan = planPath(id, role);
  return signedIn ? plan : `/login?returnUrl=${encodeURIComponent(plan)}`;
}
