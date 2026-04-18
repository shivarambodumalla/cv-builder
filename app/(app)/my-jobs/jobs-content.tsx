"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, MapPin, ChevronDown, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard, type JobCardJob } from "@/components/jobs/job-card";
import { PreferredLocationsModal } from "@/components/jobs/preferred-locations-modal";
import { getSuggestions, COMMON_ROLES, COMMON_LOCATIONS } from "@/lib/jobs/fuzzy-search";
import Link from "next/link";
import { useActivity } from "@/lib/analytics/useActivity";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CvOption {
  id: string;
  title: string;
  target_role?: string | null;
}

interface JobsContentProps {
  cvs: CvOption[];
  preferredLocationsSet: boolean;
  defaultCvId?: string | null;
  initialBestMatches?: unknown[];
  initialMoreJobs?: unknown[];
}

type JobType = "remote" | "full_time" | "part_time" | "contract" | "permanent";

// Normalise Adzuna raw shape vs already-normalised shape
function normaliseJob(j: any): JobCardJob {
  return {
    id: j.id,
    title: j.title,
    company: typeof j.company === "string" ? j.company : j.company?.display_name ?? "",
    location: typeof j.location === "string" ? j.location : j.location?.display_name ?? "",
    salary_min: j.salary_min ?? null,
    salary_max: j.salary_max ?? null,
    redirect_url: j.redirect_url ?? "",
    match_score: j.matchScore ?? j.match_score ?? null,
    created: j.created ?? "",
    contract_type: j.contract_type ?? null,
    salary_is_predicted: j.salary_is_predicted ?? null,
    match_label_text: j.matchLabelText ?? j.match_label_text ?? null,
    match_label_color: j.matchLabelColor ?? j.match_label_color ?? null,
    match_label_bg: j.matchLabelBg ?? j.match_label_bg ?? null,
    match_show_score: j.matchShowScore ?? j.match_show_score ?? true,
  };
}

const JOB_TYPE_OPTIONS: { label: string; value: JobType }[] = [
  { label: "Remote", value: "remote" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Permanent", value: "permanent" },
];

export function JobsContent({ cvs, preferredLocationsSet, defaultCvId, initialBestMatches = [], initialMoreJobs = [] }: JobsContentProps) {
  const { log } = useActivity();
  const [selectedCvId, setSelectedCvId] = useState<string>(defaultCvId ?? cvs[0]?.id ?? "");
  const [keyword, setKeyword] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<JobType>>(new Set());
  const [sortBy, setSortBy] = useState<"relevance" | "match" | "date">("date");

  const [bestMatches, setBestMatches] = useState<JobCardJob[]>(() => (initialBestMatches as Record<string, unknown>[]).map(normaliseJob));
  const [moreJobs, setMoreJobs] = useState<JobCardJob[]>(() => (initialMoreJobs as Record<string, unknown>[]).map(normaliseJob));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bestPage, setBestPage] = useState(1);
  const [morePage, setMorePage] = useState(1);
  const [hasMoreBest, setHasMoreBest] = useState(false);
  const [hasMoreMore, setHasMoreMore] = useState(false);
  const [loadingMoreBest, setLoadingMoreBest] = useState(false);
  const [loadingMoreMore, setLoadingMoreMore] = useState(false);
  const [visibleBestCount, setVisibleBestCount] = useState(10);
  const [visibleMoreCount, setVisibleMoreCount] = useState(10);

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [showLocationsModal, setShowLocationsModal] = useState(!preferredLocationsSet);

  const hasCvs = cvs.length > 0;

  // Autocomplete suggestions
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [correctedKeyword, setCorrectedKeyword] = useState<string | null>(null);
  const [correctedLocation, setCorrectedLocation] = useState<string | null>(null);

  useEffect(() => {
    setRoleSuggestions(keyword.length >= 2 ? getSuggestions(keyword, COMMON_ROLES) : []);
  }, [keyword]);

  useEffect(() => {
    setLocationSuggestions(locationInput.length >= 2 ? getSuggestions(locationInput, COMMON_LOCATIONS.filter(l => !locations.includes(l))) : []);
  }, [locationInput, locations]);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Client-side type filter — matches against contract_type field, location, and title text
  // Adzuna often returns contract_type as null, so we also infer from text
  function matchesTypeFilter(job: JobCardJob): boolean {
    if (selectedTypes.size === 0) return true;
    const loc = (job.location ?? "").toLowerCase();
    const ct = (job.contract_type ?? "").toLowerCase();
    const title = (job.title ?? "").toLowerCase();

    for (const type of selectedTypes) {
      // Remote — check location text
      if (type === "remote" && (loc.includes("remote") || title.includes("remote"))) return true;
      // Exact contract_type match
      if (ct && type === ct) return true;
      // Full-time / permanent are interchangeable
      if (type === "full_time" && (ct === "permanent" || ct === "full_time")) return true;
      if (type === "permanent" && (ct === "permanent" || ct === "full_time")) return true;
      // Infer from title/location when contract_type is missing
      if (!ct) {
        if (type === "full_time" && (title.includes("full-time") || title.includes("full time"))) return true;
        if (type === "part_time" && (title.includes("part-time") || title.includes("part time"))) return true;
        if (type === "contract" && (title.includes("contract") || title.includes("freelance"))) return true;
        if (type === "permanent" && title.includes("permanent")) return true;
      }
    }
    return false;
  }

  const buildParams = useCallback(
    (page = 1) => {
      const params = new URLSearchParams();
      if (selectedCvId) params.set("cvId", selectedCvId);
      if (keyword) params.set("keyword", keyword);
      if (locations.length > 0) params.set("location", locations.join(","));
      params.set("page", String(page));
      return params;
    },
    [selectedCvId, keyword, locations]
  );

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBestPage(1);
    setMorePage(1);
    setVisibleBestCount(10);
    setVisibleMoreCount(10);

    try {
      const params = buildParams(1);
      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Search failed");
      }
      const data = await res.json();
      const best: JobCardJob[] = (data.bestMatches ?? []).map(normaliseJob);
      const more: JobCardJob[] = (data.moreJobs ?? []).map(normaliseJob);
      setBestMatches(best);
      setMoreJobs(more);
      setCorrectedKeyword(data.correctedKeyword ?? null);
      setCorrectedLocation(data.correctedLocation ?? null);
      setHasMoreBest(best.length === 20);
      setHasMoreMore(more.length === 20);
      log("Searched jobs", { keyword: keyword || "smart match", results: best.length + more.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [buildParams, selectedCvId, keyword]);

  // Load saved job IDs on mount
  useEffect(() => {
    fetch("/api/jobs/save")
      .then((r) => r.json())
      .then((data) => {
        if (data.savedJobs) {
          setSavedJobIds(new Set(data.savedJobs.map((j: any) => j.job_id)));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-fetch jobs on mount if no initial data was server-rendered
  const didAutoFetch = useRef(false);
  useEffect(() => {
    if (!didAutoFetch.current && bestMatches.length === 0 && moreJobs.length === 0 && hasCvs) {
      didAutoFetch.current = true;
      fetchJobs();
    }
  }, [fetchJobs, bestMatches.length, moreJobs.length, hasCvs]);


  async function loadMoreBest() {
    // First reveal more from the already-fetched results
    if (visibleBestCount < bestMatches.length) {
      setVisibleBestCount((prev) => prev + 10);
      return;
    }
    // All local results shown — fetch next page from API
    const nextPage = bestPage + 1;
    setLoadingMoreBest(true);
    try {
      const params = buildParams(nextPage);
      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await res.json();
      const more: JobCardJob[] = (data.bestMatches ?? []).map(normaliseJob);
      setBestMatches((prev) => [...prev, ...more]);
      setBestPage(nextPage);
      setVisibleBestCount((prev) => prev + 10);
      setHasMoreBest(more.length === 20);
    } catch {
      // silent
    } finally {
      setLoadingMoreBest(false);
    }
  }

  async function loadMoreMore() {
    // First reveal more from already-fetched results
    if (visibleMoreCount < moreJobs.length) {
      setVisibleMoreCount((prev) => prev + 10);
      return;
    }
    // All local results shown — fetch next page from API
    const nextPage = morePage + 1;
    setLoadingMoreMore(true);
    try {
      const params = buildParams(nextPage);
      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await res.json();
      const more: JobCardJob[] = (data.moreJobs ?? []).map(normaliseJob);
      setMoreJobs((prev) => [...prev, ...more]);
      setMorePage(nextPage);
      setVisibleMoreCount((prev) => prev + 10);
      setHasMoreMore(more.length === 20);
    } catch {
      // silent
    } finally {
      setLoadingMoreMore(false);
    }
  }

  async function handleSave(job: JobCardJob) {
    await fetch("/api/jobs/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        matchScore: job.match_score,
        redirectUrl: job.redirect_url,
      }),
    });
    setSavedJobIds((prev) => new Set([...prev, job.id]));
  }

  async function handleUnsave(jobId: string) {
    await fetch(`/api/jobs/save?job_id=${encodeURIComponent(jobId)}`, {
      method: "DELETE",
    });
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  }

  function clearFilters() {
    setKeyword("");
    setLocations([]);
    setLocationInput("");
    setSelectedTypes(new Set());
  }

  const hasActiveFilters = keyword || locations.length > 0 || selectedTypes.size > 0;

  // Apply client-side type filter + sort
  const sortJobs = useCallback((jobs: JobCardJob[]) => {
    const sorted = [...jobs];
    if (sortBy === "match") sorted.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    else if (sortBy === "date") sorted.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    // "relevance" = original API order
    return sorted;
  }, [sortBy]);

  const filteredBest = useMemo(() => sortJobs(bestMatches.filter(matchesTypeFilter)), [bestMatches, selectedTypes, sortJobs]);
  const filteredMore = useMemo(() => sortJobs(moreJobs.filter(matchesTypeFilter)), [moreJobs, selectedTypes, sortJobs]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Search header card */}
      <div data-testid="jobs-filters" className="mb-8 rounded-2xl bg-[#F0EDE6] dark:bg-muted/30 p-5 sm:p-6 space-y-4">
        {/* Row 1: Title + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {hasCvs ? "Jobs matching your profile" : "Jobs near you"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filteredBest.length + filteredMore.length > 0
                ? `${filteredBest.length + filteredMore.length} results`
                : ""}
              {hasCvs && selectedCvId && (
                <> · Matched to <span className="font-medium text-foreground">{cvs.find(c => c.id === selectedCvId)?.title || cvs.find(c => c.id === selectedCvId)?.target_role || "your CV"}</span></>
              )}
            </p>
          </div>
          {hasCvs && (
            <div className="relative shrink-0">
              <select
                id="cv-select"
                data-testid="cv-selector"
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-input bg-background pl-4 pr-9 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring min-w-[180px]"
              >
                {cvs.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.title || cv.target_role || "Untitled CV"}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Row 2: Search + Location + Search button */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Keyword input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Job title or keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setRoleSuggestions(keyword.length >= 2 ? getSuggestions(keyword, COMMON_ROLES) : [])}
              onBlur={() => setTimeout(() => setRoleSuggestions([]), 150)}
              data-testid="jobs-search"
              className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              autoComplete="off"
            />
            {roleSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border bg-background shadow-md py-1 max-h-48 overflow-y-auto">
                {roleSuggestions.map((s) => (
                  <button key={s} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors" onMouseDown={() => { setKeyword(s); setRoleSuggestions([]); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location input with chips */}
          <div className="relative flex-1">
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-input bg-background px-3 min-h-[48px]">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              {locations.map((loc) => (
                <span key={loc} className="inline-flex items-center gap-1 rounded-full bg-[#065F46] px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {loc}
                  <button type="button" onClick={() => setLocations(prev => prev.filter(l => l !== loc))} className="hover:text-white/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                placeholder={locations.length === 0 ? "City, country..." : ""}
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onFocus={() => setLocationSuggestions(locationInput.length >= 2 ? getSuggestions(locationInput, COMMON_LOCATIONS.filter(l => !locations.includes(l))) : [])}
                onBlur={() => setTimeout(() => setLocationSuggestions([]), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && locationInput.trim() && locations.length < 5) {
                    e.preventDefault();
                    const match = getSuggestions(locationInput, COMMON_LOCATIONS.filter(l => !locations.includes(l)), 1);
                    const toAdd = match[0] || locationInput.trim();
                    if (!locations.includes(toAdd)) {
                      setLocations(prev => [...prev, toAdd]);
                      setLocationInput("");
                    }
                  }
                  if (e.key === "Backspace" && !locationInput && locations.length > 0) {
                    setLocations(prev => prev.slice(0, -1));
                  }
                }}
                className="flex-1 min-w-[80px] bg-transparent text-sm outline-none py-3 placeholder:text-muted-foreground"
                autoComplete="off"
                disabled={locations.length >= 5}
              />
            </div>
            {locationSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border bg-background shadow-md py-1 max-h-48 overflow-y-auto">
                {locationSuggestions.map((s) => (
                  <button key={s} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors" onMouseDown={() => { setLocations(prev => [...prev, s]); setLocationInput(""); setLocationSuggestions([]); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <Button
            onClick={fetchJobs}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#065F46] hover:bg-[#065F46]/90 text-white font-semibold text-sm shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Row 3: Job type chips — only show types that exist in results */}
        <div className="flex flex-wrap items-center gap-2">
          {JOB_TYPE_OPTIONS.filter((o) => {
            // Only show filter if at least 1 job matches this type
            const allJobs = [...bestMatches, ...moreJobs];
            return allJobs.some((j) => {
              const ct = (j.contract_type ?? "").toLowerCase();
              const loc = (j.location ?? "").toLowerCase();
              if (o.value === "remote") return loc.includes("remote");
              if (o.value === "full_time") return ct === "full_time" || ct === "permanent";
              if (o.value === "permanent") return ct === "permanent" || ct === "full_time";
              return ct === o.value;
            });
          }).map((o) => {
            const isSelected = selectedTypes.has(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setSelectedTypes(prev => {
                  const next = new Set(prev);
                  if (next.has(o.value)) next.delete(o.value); else next.add(o.value);
                  return next;
                })}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-[#065F46] text-white border-[#065F46]"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                {o.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* No CV banner */}
      {!hasCvs && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border-2 border-dashed border-[#065F46]/30 bg-[#F0FDF4] px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#065F46]/10">
            <UploadCloud className="h-5 w-5 text-[#065F46]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#065F46]">Upload your CV for personalised job matches</p>
            <p className="text-xs text-[#065F46]/60">Get match scores and better recommendations based on your skills</p>
          </div>
          <Link href="/upload-resume">
            <Button size="sm" className="bg-[#065F46] hover:bg-[#065F46]/90 text-white text-xs">
              Upload CV
            </Button>
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="space-y-10">
          {/* Did you mean? */}
          {(correctedKeyword || correctedLocation) && (
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 px-4 py-2.5 text-sm">
              Showing results for{" "}
              {correctedKeyword && <button className="font-semibold text-primary hover:underline" onClick={() => setKeyword(correctedKeyword)}>{correctedKeyword}</button>}
              {correctedKeyword && correctedLocation && " in "}
              {correctedLocation && <button className="font-semibold text-primary hover:underline" onClick={() => setLocations([correctedLocation])}>{correctedLocation}</button>}
            </div>
          )}

          {/* Best matches */}
          {filteredBest.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  {hasCvs ? "Best matches" : "Recommended for you"}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredBest.length})</span>
                </h2>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "relevance" | "match" | "date")}
                    className="h-8 appearance-none rounded-lg border border-input bg-background pl-3 pr-7 text-xs font-medium text-muted-foreground focus:outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="match">Match score</option>
                    <option value="date">Most recent</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                {filteredBest.slice(0, visibleBestCount).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    isSaved={savedJobIds.has(job.id)}
                    showMatchScore={hasCvs}
                    hasCV={hasCvs}
                  />
                ))}
              </div>
              {(visibleBestCount < filteredBest.length || hasMoreBest) && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreBest}
                    disabled={loadingMoreBest}
                    className="gap-2"
                  >
                    {loadingMoreBest ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                    ) : (
                      "Show more"
                    )}
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* More opportunities */}
          {filteredMore.length > 0 && (
            <section>
              <h2 className="mb-4 text-base font-semibold">
                More opportunities
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredMore.length})
                </span>
              </h2>
              <div className="space-y-3">
                {filteredMore.slice(0, visibleMoreCount).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    isSaved={savedJobIds.has(job.id)}
                    showMatchScore={hasCvs}
                    hasCV={hasCvs}
                  />
                ))}
              </div>
              {(visibleMoreCount < filteredMore.length || hasMoreMore) && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreMore}
                    disabled={loadingMoreMore}
                    className="gap-2"
                  >
                    {loadingMoreMore ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Empty state */}
          {filteredBest.length === 0 && filteredMore.length === 0 && (
            <div className="space-y-6">
              {/* Type filter excluded all results — show specific message */}
              {selectedTypes.size > 0 && (bestMatches.length > 0 || moreJobs.length > 0) && (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No {[...selectedTypes].map(t => t.replace("_", "-")).join(" / ")} jobs found</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {bestMatches.length + moreJobs.length} jobs loaded but none match the selected type. Try a different filter.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTypes(new Set())} className="mt-1">Clear type filter</Button>
                </div>
              )}
              {/* General no results */}
              {!(selectedTypes.size > 0 && (bestMatches.length > 0 || moreJobs.length > 0)) && hasActiveFilters && (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No jobs found for your filters</p>
                  <p className="text-sm text-muted-foreground max-w-xs">Try different keywords or remove some filters.</p>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-1">Clear filters</Button>
                </div>
              )}
              {!hasCvs && !hasActiveFilters && (
                <div className="rounded-2xl border-2 border-dashed border-[#065F46]/30 bg-[#F0FDF4] p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#065F46]/10">
                    <UploadCloud className="h-7 w-7 text-[#065F46]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#065F46]">Upload your CV to see matched jobs</h3>
                  <p className="mt-1 text-sm text-[#065F46]/70 max-w-sm mx-auto">
                    We analyse your skills, experience, and preferences to find the best jobs for you. You can still search manually above.
                  </p>
                  <Link href="/upload-resume">
                    <Button className="mt-5 bg-[#065F46] hover:bg-[#065F46]/90 text-white px-8">Upload CV</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preferred locations modal */}
      <PreferredLocationsModal
        open={showLocationsModal}
        onClose={() => setShowLocationsModal(false)}
      />
    </div>
  );
}

