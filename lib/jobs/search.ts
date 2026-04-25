// Unified job search — aggregates results from all enabled providers
// Add new providers here by registering them in getProviders()

import { createAdminClient } from "@/lib/supabase/admin";
import { AdzunaProvider } from "./adzuna";
import { JoobleProvider } from "./jooble";
import { CareerjetProvider } from "./careerjet";
import type { IJobProvider, SearchParams, SearchResponse, ProviderConfig, GenericJob } from "./types";
import { EMPTY_RESPONSE } from "./types";

// ─── Provider registry ───────────────────────────────────────────────────────

const PROVIDER_FACTORIES: Record<string, (config: ProviderConfig) => IJobProvider> = {
  adzuna: (config) => new AdzunaProvider(config),
  jooble: (config) => new JoobleProvider(config),
  careerjet: (config) => new CareerjetProvider(config),
  // Add new providers here:
  // indeed: (config) => new IndeedProvider(config),
  // linkedin: (config) => new LinkedInProvider(config),
};

// ─── Provider cache ──────────────────────────────────────────────────────────

let cachedProviders: { data: IJobProvider[]; at: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getProviders(): Promise<IJobProvider[]> {
  if (cachedProviders && Date.now() - cachedProviders.at < CACHE_TTL_MS) {
    return cachedProviders.data;
  }

  try {
    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("job_providers")
      .select("name, app_id, app_key, api_base_url, enabled, config")
      .eq("enabled", true)
      .order("priority", { ascending: false });

    if (error) {
      console.error("[job-search] Failed to fetch providers:", error.message);
      return [];
    }

    const providers: IJobProvider[] = [];

    for (const row of rows ?? []) {
      const factory = PROVIDER_FACTORIES[row.name];
      if (!factory) {
        console.warn(`[job-search] No factory for provider: ${row.name}`);
        continue;
      }

      providers.push(
        factory({
          name: row.name,
          appId: row.app_id ?? "",
          appKey: row.app_key ?? "",
          apiBaseUrl: row.api_base_url ?? "",
          enabled: row.enabled ?? false,
          config: row.config ?? null,
        })
      );
    }

    console.log(`[job-search] Loaded ${providers.length} providers: ${providers.map(p => p.name).join(", ")}`);
    cachedProviders = { data: providers, at: Date.now() };
    return providers;
  } catch (err) {
    console.error("[job-search] Provider init failed:", err);
    return [];
  }
}

// ─── Unified search ──────────────────────────────────────────────────────────

/**
 * Search all enabled providers in parallel, merge and deduplicate results.
 * This is the main entry point for all job searches in the app.
 */
export async function searchAllProviders(params: SearchParams): Promise<SearchResponse> {
  const providers = await getProviders();

  if (providers.length === 0) {
    console.warn("[job-search] No enabled providers found");
    return EMPTY_RESPONSE;
  }

  // Search all providers in parallel
  const results = await Promise.allSettled(
    providers.map((p) => {
      console.log(`[job-search] Searching ${p.name}: "${params.what}" in "${params.where || "anywhere"}"`);
      return p.search(params);
    })
  );

  // Log per-provider results
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const name = providers[i].name;
    if (r.status === "fulfilled") {
      console.log(`[job-search] ${name}: ${r.value.results.length} results`);
    } else {
      console.error(`[job-search] ${name} failed:`, r.reason);
    }
  }

  // Merge results, deduplicate by title+company (cross-provider) and provider:id (within provider)
  const seenKeys = new Set<string>();
  const merged: GenericJob[] = [];
  let totalCount = 0;
  let totalMean = 0;
  let meanCount = 0;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const response = result.value;
    totalCount += response.count;
    if (response.mean > 0) {
      totalMean += response.mean;
      meanCount++;
    }

    for (const job of response.results) {
      // Cross-provider dedup: normalize title+company to catch the same listing on multiple boards
      const titleKey = `${job.title.toLowerCase().trim()}::${job.company.toLowerCase().trim()}`;
      const idKey = `${job.provider}:${job.id}`;

      if (!seenKeys.has(titleKey) && !seenKeys.has(idKey)) {
        seenKeys.add(titleKey);
        seenKeys.add(idKey);
        merged.push(job);
      }
    }
  }

  return {
    results: merged,
    count: totalCount,
    mean: meanCount > 0 ? totalMean / meanCount : 0,
  };
}
