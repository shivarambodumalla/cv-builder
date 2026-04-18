"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Building2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
}

interface JobsWidgetProps {
  cvTitle?: string;
  skills?: string[];
  jdKeywords?: string[];
  cvId?: string;
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="h-3 w-2/3 rounded bg-muted" />
      <div className="h-2.5 w-1/2 rounded bg-muted" />
      <div className="h-2.5 w-1/3 rounded bg-muted" />
    </div>
  );
}

export function JobsWidget({ cvTitle, skills, jdKeywords, cvId }: JobsWidgetProps) {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cvId) {
      setLoading(false);
      setError(true);
      return;
    }

    const keyword = (jdKeywords && jdKeywords.length > 0)
      ? jdKeywords[0]
      : (cvTitle ?? "");

    // Build params — cvId is always sent so the API can use the smart matcher
    const params = new URLSearchParams({ cvId, limit: "5" });
    if (keyword) params.set("keyword", keyword);

    fetch(`/api/jobs/search?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const results: JobResult[] = data.bestMatches ?? [];
        setJobs(results.slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [cvTitle, jdKeywords, cvId]);

  return (
    <div data-testid="jobs-widget" className="mt-8 space-y-2">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Matching Jobs</h4>
        <Link
          href="/my-jobs"
          className="text-[11px] font-medium hover:underline"
          style={{ color: "#065F46" }}
        >
          View all
        </Link>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error / empty */}
      {!loading && (error || jobs.length === 0) && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">No jobs found.</p>
          <Link
            href="/my-jobs"
            className="mt-1 inline-flex items-center text-xs font-medium hover:underline"
            style={{ color: "#065F46" }}
          >
            Browse all jobs
          </Link>
        </div>
      )}

      {/* Job cards */}
      {!loading && !error && jobs.map((job) => {
        const salary = formatSalary(job.salary_min, job.salary_max);
        return (
          <div
            key={job.id}
            data-testid="jobs-widget-card"
            className="rounded-lg border border-border bg-card p-3 space-y-1 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-bold leading-tight text-foreground line-clamp-1">
                {job.title}
              </p>
              <a
                href={job.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold text-white transition-colors",
                )}
                style={{ backgroundColor: "#065F46" }}
              >
                Apply
              </a>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Building2 className="h-3 w-3 shrink-0" />
                {job.company.display_name}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {job.location.display_name}
              </span>
            </div>
            {salary && (
              <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <DollarSign className="h-3 w-3 shrink-0" />
                {salary}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer link */}
      {!loading && !error && jobs.length > 0 && (
        <Link
          href="/my-jobs"
          className="flex items-center justify-center py-1 text-[12px] font-medium hover:underline"
          style={{ color: "#065F46" }}
        >
          View all matching jobs
        </Link>
      )}
    </div>
  );
}
