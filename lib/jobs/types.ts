// Generic job types — provider-agnostic
// Every job provider (Adzuna, Indeed, LinkedIn, etc.) normalizes to these types

export interface GenericJob {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_is_predicted: boolean;
  redirect_url: string;
  created: string;
  contract_type: string | null;
  category: string | null;
  provider: string;
}

export interface SearchParams {
  what: string;
  where?: string;
  country?: string;
  results_per_page?: number;
  page?: number;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  sort_by?: "relevance" | "date" | "salary";
}

export interface SearchResponse {
  results: GenericJob[];
  count: number;
  mean: number;
}

export const EMPTY_RESPONSE: SearchResponse = { results: [], count: 0, mean: 0 };

// Provider interface — implement this for each job board
export interface IJobProvider {
  name: string;
  search(params: SearchParams): Promise<SearchResponse>;
}

// Provider credentials from job_providers table
export interface ProviderConfig {
  name: string;
  appId: string;
  appKey: string;
  apiBaseUrl: string;
  enabled: boolean;
  config: Record<string, unknown> | null;
}
