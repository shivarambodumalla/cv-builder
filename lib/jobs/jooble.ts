// Jooble job provider
// API docs: https://jooble.org/api/about
// POST https://jooble.org/api/{api-key}
// Body: { keywords, location, page }
// Response: { totalCount, jobs: [{ title, location, snippet, salary, source, type, link, company, updated, id }] }

import type { GenericJob, SearchParams, SearchResponse, IJobProvider, ProviderConfig } from "./types";
import { EMPTY_RESPONSE } from "./types";

// ─── Raw Jooble API types ────────────────────────────────────────────────────

interface JoobleRawJob {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company: string;
  updated: string;
  id: string;
}

interface JoobleRawResponse {
  totalCount: number;
  jobs: JoobleRawJob[];
}

// ─── Parse salary string → min/max ──────────────────────────────────────────

function parseSalary(salaryStr: string): { min: number | null; max: number | null } {
  if (!salaryStr) return { min: null, max: null };

  // Remove currency symbols and whitespace, normalize
  const cleaned = salaryStr.replace(/[£€₹$,\s]/g, "").toLowerCase();

  // Range: "80000-120000" or "80k-120k"
  const rangeMatch = cleaned.match(/(\d+\.?\d*)k?\s*[-–to]+\s*(\d+\.?\d*)k?/);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1]);
    let max = parseFloat(rangeMatch[2]);
    if (cleaned.includes("k") || min < 1000) { min *= 1000; max *= 1000; }
    return { min, max };
  }

  // Single value: "80000" or "80k"
  const singleMatch = cleaned.match(/(\d+\.?\d*)k?/);
  if (singleMatch) {
    let val = parseFloat(singleMatch[1]);
    if (cleaned.includes("k") || val < 1000) val *= 1000;
    return { min: val, max: null };
  }

  return { min: null, max: null };
}

// ─── Map Jooble type to contract_type ────────────────────────────────────────

function mapContractType(type: string): string | null {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower.includes("full")) return "full_time";
  if (lower.includes("part")) return "part_time";
  if (lower.includes("contract") || lower.includes("temporary")) return "contract";
  if (lower.includes("intern")) return "internship";
  return null;
}

// ─── Normalize Jooble → GenericJob ───────────────────────────────────────────

function normalizeJoobleJob(raw: JoobleRawJob): GenericJob {
  const { min, max } = parseSalary(raw.salary);

  return {
    id: raw.id || `jooble-${raw.link?.slice(-20) || Math.random().toString(36)}`,
    title: raw.title ?? "",
    description: raw.snippet ?? "",
    company: raw.company ?? "",
    location: raw.location ?? "",
    salary_min: min,
    salary_max: max,
    salary_is_predicted: false,
    redirect_url: raw.link ?? "",
    created: raw.updated ?? new Date().toISOString(),
    contract_type: mapContractType(raw.type),
    category: null,
    provider: "jooble",
  };
}

// ─── Response cache (30 min) ─────────────────────────────────────────────────

interface CacheEntry {
  data: SearchResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Jooble provider ─────────────────────────────────────────────────────────

export class JoobleProvider implements IJobProvider {
  name = "jooble";
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    if (!this.config.enabled || !this.config.appKey) {
      console.warn(`[jooble] Skipping: enabled=${this.config.enabled}, appKey=${!!this.config.appKey}`);
      return EMPTY_RESPONSE;
    }

    const cacheKey = `jooble:${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const {
      what,
      where,
      page = 1,
      results_per_page = 20,
      salary_min,
    } = params;

    // Jooble API: POST https://jooble.org/api/{api-key}
    const apiUrl = this.config.apiBaseUrl || `https://jooble.org/api/${this.config.appKey}`;

    const body: Record<string, unknown> = {
      keywords: what,
      page: String(page),
    };

    if (where) body.location = where;
    if (salary_min) body.salary = String(salary_min);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error(`[jooble] API error: ${response.status}`);
        return EMPTY_RESPONSE;
      }

      const data = (await response.json()) as JoobleRawResponse;
      const jobs = (data.jobs ?? [])
        .slice(0, results_per_page)
        .map(normalizeJoobleJob);

      const result: SearchResponse = {
        results: jobs,
        count: data.totalCount ?? jobs.length,
        mean: 0,
      };

      cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    } catch (err) {
      console.error("[jooble] Fetch failed:", err);
      return EMPTY_RESPONSE;
    }
  }
}
