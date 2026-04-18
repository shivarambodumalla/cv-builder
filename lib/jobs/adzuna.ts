// Adzuna job provider
// Implements IJobProvider — normalizes Adzuna responses to GenericJob

import type { GenericJob, SearchParams, SearchResponse, IJobProvider, ProviderConfig } from "./types";
import { EMPTY_RESPONSE } from "./types";

// ─── Raw Adzuna API types (internal only) ────────────────────────────────────

interface AdzunaRawJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min: number;
  salary_max: number;
  salary_is_predicted: "1" | "0";
  description: string;
  redirect_url: string;
  created: string;
  contract_type: string;
  category: { label: string; tag: string };
}

interface AdzunaRawResponse {
  results: AdzunaRawJob[];
  count: number;
  mean: number;
}

// ─── Normalize Adzuna → GenericJob ───────────────────────────────────────────

function normalizeAdzunaJob(raw: AdzunaRawJob): GenericJob {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? "",
    company: raw.company?.display_name ?? "",
    location: raw.location?.display_name ?? "",
    salary_min: raw.salary_min ?? null,
    salary_max: raw.salary_max ?? null,
    salary_is_predicted: raw.salary_is_predicted === "1",
    redirect_url: raw.redirect_url ?? "",
    created: raw.created ?? "",
    contract_type: raw.contract_type ?? null,
    category: raw.category?.label ?? null,
    provider: "adzuna",
  };
}

// ─── Response cache (30 min) ─────────────────────────────────────────────────

interface CacheEntry {
  data: SearchResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCacheKey(params: SearchParams): string {
  return `adzuna:${JSON.stringify(params)}`;
}

function getFromCache(key: string): SearchResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: SearchResponse): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Adzuna provider ─────────────────────────────────────────────────────────

export class AdzunaProvider implements IJobProvider {
  name = "adzuna";
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    if (!this.config.enabled || !this.config.appId || !this.config.appKey) {
      console.warn(`[adzuna] Skipping: enabled=${this.config.enabled}, appId=${!!this.config.appId}, appKey=${!!this.config.appKey}`);
      return EMPTY_RESPONSE;
    }

    const cacheKey = getCacheKey(params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const {
      what,
      where,
      country = "us",
      results_per_page = 20,
      page = 1,
      salary_min,
      salary_max,
      contract_type,
      sort_by = "relevance",
    } = params;

    const baseUrl = this.config.apiBaseUrl || "https://api.adzuna.com/v1/api/jobs";
    const url = new URL(`${baseUrl}/${country}/search/${page}`);
    url.searchParams.set("app_id", this.config.appId);
    url.searchParams.set("app_key", this.config.appKey);
    url.searchParams.set("what", what);
    url.searchParams.set("results_per_page", String(results_per_page));
    url.searchParams.set("sort_by", sort_by);
    url.searchParams.set("content-type", "application/json");

    if (where) url.searchParams.set("where", where);
    if (salary_min != null) url.searchParams.set("salary_min", String(salary_min));
    if (salary_max != null) url.searchParams.set("salary_max", String(salary_max));
    if (contract_type) url.searchParams.set("contract_type", contract_type);

    try {
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });

      if (!response.ok) return EMPTY_RESPONSE;

      const data = (await response.json()) as AdzunaRawResponse;
      const normalized: SearchResponse = {
        results: (data.results ?? []).map(normalizeAdzunaJob),
        count: data.count ?? 0,
        mean: data.mean ?? 0,
      };

      setCache(cacheKey, normalized);
      return normalized;
    } catch {
      return EMPTY_RESPONSE;
    }
  }
}

// ─── Backward-compatible searchJobs (used by existing code) ──────────────────

import { createAdminClient } from "@/lib/supabase/admin";

let cachedProvider: { data: AdzunaProvider; at: number } | null = null;
const PROVIDER_TTL_MS = 5 * 60 * 1000;

async function getProvider(): Promise<AdzunaProvider> {
  if (cachedProvider && Date.now() - cachedProvider.at < PROVIDER_TTL_MS) return cachedProvider.data;

  let data: { app_id?: string; app_key?: string; api_base_url?: string; enabled?: boolean } | null = null;
  try {
    const admin = createAdminClient();
    const res = await admin
      .from("job_providers")
      .select("app_id, app_key, api_base_url, enabled")
      .eq("name", "adzuna")
      .single();
    data = res.data;
  } catch {
    // Table may not exist yet
  }

  const provider = new AdzunaProvider({
    name: "adzuna",
    appId: data?.app_id || "",
    appKey: data?.app_key || "",
    apiBaseUrl: data?.api_base_url || "https://api.adzuna.com/v1/api/jobs",
    enabled: data?.enabled ?? false,
    config: null,
  });

  cachedProvider = { data: provider, at: Date.now() };
  return provider;
}

/** @deprecated Use searchAllProviders() from lib/jobs/search.ts for new code */
export async function searchJobs(params: SearchParams): Promise<SearchResponse> {
  const provider = await getProvider();
  return provider.search(params);
}

// Re-export GenericJob as AdzunaJob for backward compatibility
export type { GenericJob as AdzunaJob } from "./types";
