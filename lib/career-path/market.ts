// Live market snapshot for a job title: open-job count and salary range from
// job-board listings (Adzuna, plus Careerjet for salaries). Never comes from
// the AI. Cached 24h per (title, country); fail-soft.

import { unstable_cache } from "next/cache";
import { searchProvider } from "@/lib/jobs/search";
import { isRelevantTitle } from "@/lib/jobs/role-relevance";
import { normaliseRole, salaryStats } from "./normalise";
import type { RoleMarket } from "./types";

const DEFAULT_COUNTRY = "us";
const TIMEOUT_MS = 6000;
const REVALIDATE_SECONDS = 86400;
const RESULTS_PER_PAGE = 50;

/**
 * Countries Adzuna serves (it is the provider that honours `country` and
 * carries most of the salary data), with their currency and a minimum
 * plausible annual full-time salary used to drop hourly/daily/monthly figures
 * (see salaryStats in ./normalise). Any other country falls back to "us":
 * showing US numbers labelled as US beats showing another market's numbers
 * labelled as the visitor's.
 */
const MARKETS: Record<string, { currency: string; annualFloor: number }> = {
  us: { currency: "USD", annualFloor: 15000 },
  ca: { currency: "CAD", annualFloor: 20000 },
  gb: { currency: "GBP", annualFloor: 12000 },
  au: { currency: "AUD", annualFloor: 25000 },
  nz: { currency: "NZD", annualFloor: 25000 },
  sg: { currency: "SGD", annualFloor: 15000 },
  in: { currency: "INR", annualFloor: 120000 },
  za: { currency: "ZAR", annualFloor: 50000 },
  de: { currency: "EUR", annualFloor: 15000 },
  at: { currency: "EUR", annualFloor: 15000 },
  be: { currency: "EUR", annualFloor: 15000 },
  fr: { currency: "EUR", annualFloor: 15000 },
  es: { currency: "EUR", annualFloor: 10000 },
  it: { currency: "EUR", annualFloor: 10000 },
  nl: { currency: "EUR", annualFloor: 15000 },
  ch: { currency: "CHF", annualFloor: 30000 },
  pl: { currency: "PLN", annualFloor: 30000 },
  br: { currency: "BRL", annualFloor: 15000 },
  mx: { currency: "MXN", annualFloor: 60000 },
};

function marketCountry(country: string | null | undefined): string {
  const code = (country ?? "").trim().toLowerCase();
  if (code === "uk") return "gb";
  return code in MARKETS ? code : DEFAULT_COUNTRY;
}

/** Visitor country from Vercel's geo header, limited to countries the providers cover. */
export function countryFromHeaders(headers: Headers): string {
  return marketCountry(headers.get("x-vercel-ip-country"));
}

function slugify(title: string): string {
  return title.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Uncached fetch. Throws when Adzuna returns nothing, so a failed call is not
 * cached for 24h (unstable_cache only stores resolved values). Adzuna reports
 * a rate-limited or failed request the same way as zero results, and a real
 * title with zero US listings is rare, so "nothing" is treated as "unknown".
 */
async function fetchRoleMarket(title: string, country: string): Promise<RoleMarket> {
  // One Adzuna query with the title matched against job titles gives both the
  // open-jobs count and the most relevant salary listings. A keyword-anywhere
  // count summed across providers double-counts listings and matches loosely
  // ("Analytics Manager" returned every manager job). Careerjet adds salary
  // listings only. Jooble is not used: its salary parser drops the pay period,
  // so "$25 - $30 per hour" arrives as 25,000-30,000.
  const [adzuna, careerjet] = await Promise.all([
    searchProvider("adzuna", { what: title, country, results_per_page: RESULTS_PER_PAGE, title_only: true }),
    searchProvider("careerjet", { what: title, country, results_per_page: RESULTS_PER_PAGE, sort_by: "relevance" }),
  ]);

  if (adzuna.count === 0 && adzuna.results.length === 0) {
    throw new Error(`No Adzuna results for "${title}" (${country})`);
  }

  // Titles still vary ("Senior Data Analyst, Marketing"), so only listings
  // whose title names the role feed the salary range.
  const salaryListings = [...adzuna.results, ...careerjet.results].filter((job) =>
    isRelevantTitle(job.title, slugify(title), title)
  );
  const { currency, annualFloor } = MARKETS[country];

  return {
    country,
    currency,
    openJobs: adzuna.count,
    ...salaryStats(salaryListings, annualFloor),
    fetchedAt: new Date().toISOString(),
  };
}

const cachedRoleMarket = unstable_cache(fetchRoleMarket, ["career-path-role-market-v3"], {
  revalidate: REVALIDATE_SECONDS,
});

/**
 * Market data for a job title in a country (default "us"). Returns null on
 * provider failure, no results, or after ~6s; never throws.
 */
export async function getRoleMarket(title: string, country?: string): Promise<RoleMarket | null> {
  const query = normaliseRole(title ?? "");
  if (query.length < 2) return null;
  const code = marketCountry(country);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), TIMEOUT_MS);
  });

  try {
    return await Promise.race([cachedRoleMarket(query, code), timeout]);
  } catch (err) {
    console.error(`[career-path/market] "${query}" (${code}):`, err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
