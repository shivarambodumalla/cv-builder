// Careerjet job provider
// API docs: https://www.careerjet.com/partners/api/
// GET http://public.api.careerjet.net/search (HTTPS not supported)
// Requires Referer + User-Agent headers; affid identifies the partner.

import type { GenericJob, SearchParams, SearchResponse, IJobProvider, ProviderConfig } from "./types";
import { EMPTY_RESPONSE } from "./types";

// ─── Raw Careerjet API types ────────────────────────────────────────────────

interface CareerjetRawJob {
  title: string;
  description: string;
  company: string;
  locations: string;
  url: string;
  date: string;
  site: string;
  salary?: string;
  salary_min?: string;
  salary_max?: string;
  salary_currency_code?: string;
  salary_type?: "Y" | "M" | "W" | "D" | "H";
}

interface CareerjetRawResponse {
  type: string;
  jobs?: CareerjetRawJob[];
  hits?: number;
  pages?: number;
  error?: string;
}

// ─── Country code → Careerjet locale_code ────────────────────────────────────
// Careerjet runs a per-country site; locale_code picks which one to query.
// Covers every code lib/jobs/matcher.ts:CITY_TO_COUNTRY can produce, plus the
// major Careerjet markets users typically search. Unknown codes fall back to
// en_US (Careerjet's default site).

const COUNTRY_TO_LOCALE: Record<string, string> = {
  // English-language markets
  us: "en_US",
  gb: "en_GB", uk: "en_GB",
  au: "en_AU",
  ca: "en_CA",
  in: "en_IN",
  sg: "en_SG",
  za: "en_ZA",
  ie: "en_IE",
  nz: "en_NZ",
  ph: "en_PH",
  my: "en_MY",
  hk: "en_HK",
  th: "en_TH",
  id: "en_ID",
  pk: "en_PK",
  bd: "en_BD",
  ng: "en_NG",
  // Middle East
  ae: "en_AE",
  sa: "en_SA",
  qa: "en_QA",
  kw: "en_KW",
  bh: "en_BH",
  om: "en_OM",
  eg: "en_EG",
  il: "en_IL",
  // Europe
  de: "de_DE",
  fr: "fr_FR",
  nl: "nl_NL",
  es: "es_ES",
  it: "it_IT",
  pt: "pt_PT",
  pl: "pl_PL",
  se: "sv_SE",
  no: "no_NO",
  dk: "da_DK",
  fi: "fi_FI",
  ch: "de_CH",
  at: "de_AT",
  be: "fr_BE",
  lu: "fr_LU",
  gr: "el_GR",
  cz: "cs_CZ",
  sk: "sk_SK",
  hu: "hu_HU",
  ro: "ro_RO",
  bg: "bg_BG",
  hr: "hr_HR",
  ua: "uk_UA",
  ru: "ru_RU",
  tr: "tr_TR",
  // Asia-Pacific (non-English)
  jp: "ja_JP",
  kr: "ko_KR",
  cn: "zh_CN",
  tw: "zh_TW",
  vn: "vi_VN",
  // Latin America
  mx: "es_MX",
  br: "pt_BR",
  ar: "es_AR",
  cl: "es_CL",
  co: "es_CO",
  pe: "es_PE",
  ve: "es_VE",
  // Africa
  ma: "fr_MA",
  tn: "fr_TN",
};

// ─── Annualize salary based on salary_type ───────────────────────────────────
// salary_type: Y=year, M=month, W=week, D=day, H=hour. Normalize to annual.

const ANNUALIZE_FACTOR: Record<string, number> = {
  Y: 1,
  M: 12,
  W: 52,
  D: 260,
  H: 2080,
};

function toAnnualSalary(value: string | undefined, type: string | undefined): number | null {
  if (!value) return null;
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return null;
  const factor = ANNUALIZE_FACTOR[type ?? "Y"] ?? 1;
  return Math.round(n * factor);
}

// ─── Strip the <b>…</b> highlight tags Careerjet wraps around matched terms ──

function stripHighlights(html: string): string {
  return (html || "").replace(/<\/?b>/gi, "");
}

// ─── Normalize Careerjet → GenericJob ───────────────────────────────────────

function normalizeCareerjetJob(raw: CareerjetRawJob, idx: number): GenericJob {
  const created = (() => {
    const d = new Date(raw.date);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  })();

  // Careerjet doesn't return a stable id — synthesize one from URL + title.
  const id = `careerjet-${(raw.url || "").slice(-40) || `${idx}-${raw.title?.slice(0, 20)}`}`;

  return {
    id,
    title: stripHighlights(raw.title) || "",
    description: stripHighlights(raw.description) || "",
    company: raw.company ?? "",
    location: raw.locations ?? "",
    salary_min: toAnnualSalary(raw.salary_min, raw.salary_type),
    salary_max: toAnnualSalary(raw.salary_max, raw.salary_type),
    salary_is_predicted: false,
    redirect_url: raw.url ?? "",
    created,
    contract_type: null,
    category: null,
    provider: "careerjet",
  };
}

// ─── Response cache (30 min) ─────────────────────────────────────────────────

interface CacheEntry {
  data: SearchResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Careerjet provider ─────────────────────────────────────────────────────

export class CareerjetProvider implements IJobProvider {
  name = "careerjet";
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    if (!this.config.enabled || !this.config.appKey) {
      console.warn(`[careerjet] Skipping: enabled=${this.config.enabled}, appKey=${!!this.config.appKey}`);
      return EMPTY_RESPONSE;
    }

    const cacheKey = `careerjet:${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const {
      what,
      where,
      country = "us",
      page = 1,
      results_per_page = 20,
      sort_by = "relevance",
    } = params;

    const locale = COUNTRY_TO_LOCALE[country.toLowerCase()] ?? "en_US";
    const baseUrl = this.config.apiBaseUrl || "http://public.api.careerjet.net/search";
    const refererUrl = "https://www.thecvedge.com/jobs";
    const userAgent = "Mozilla/5.0 (compatible; CVEdgeBot/1.0)";

    const url = new URL(baseUrl);
    url.searchParams.set("locale_code", locale);
    url.searchParams.set("keywords", what);
    if (where) url.searchParams.set("location", where);
    url.searchParams.set("affid", this.config.appKey);
    url.searchParams.set("user_ip", "0.0.0.0");
    url.searchParams.set("user_agent", userAgent);
    url.searchParams.set("url", refererUrl);
    url.searchParams.set("pagesize", String(Math.min(results_per_page, 99)));
    url.searchParams.set("page", String(page));
    if (sort_by === "date") url.searchParams.set("sort", "date");
    else if (sort_by === "salary") url.searchParams.set("sort", "salary");

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          Referer: refererUrl,
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) {
        console.error(`[careerjet] API error: ${response.status}`);
        return EMPTY_RESPONSE;
      }

      const data = (await response.json()) as CareerjetRawResponse;

      if (data.type !== "JOBS") {
        console.error(`[careerjet] API returned ${data.type}: ${data.error ?? "unknown"}`);
        return EMPTY_RESPONSE;
      }

      const jobs = (data.jobs ?? []).map(normalizeCareerjetJob);

      const result: SearchResponse = {
        results: jobs,
        count: data.hits ?? jobs.length,
        mean: 0,
      };

      cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    } catch (err) {
      console.error("[careerjet] Fetch failed:", err);
      return EMPTY_RESPONSE;
    }
  }
}
