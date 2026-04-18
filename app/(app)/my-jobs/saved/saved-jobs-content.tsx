"use client";

import { useState } from "react";
import { Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard, type JobCardJob } from "@/components/jobs/job-card";
import Link from "next/link";

interface SavedJobRow {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  redirect_url: string;
  match_score: number | null;
  job_board: string;
  status: string;
  saved_at: string;
}

interface SavedJobsContentProps {
  activeJobs: SavedJobRow[];
  expiredJobs: SavedJobRow[];
}

function rowToCardJob(row: SavedJobRow): JobCardJob {
  return {
    id: row.job_id,
    title: row.job_title,
    company: row.company,
    location: row.location,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    redirect_url: row.redirect_url,
    match_score: row.match_score,
    created: row.saved_at, // use saved_at as fallback date for relative display
    contract_type: null,
    salary_is_predicted: null,
  };
}

export function SavedJobsContent({ activeJobs, expiredJobs }: SavedJobsContentProps) {
  const [activeList, setActiveList] = useState<SavedJobRow[]>(activeJobs);
  const [expiredList, setExpiredList] = useState<SavedJobRow[]>(expiredJobs);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set([...activeJobs, ...expiredJobs].map((j) => j.job_id))
  );

  async function handleUnsave(jobId: string) {
    await fetch(`/api/jobs/save?job_id=${encodeURIComponent(jobId)}`, {
      method: "DELETE",
    });
    setActiveList((prev) => prev.filter((j) => j.job_id !== jobId));
    setExpiredList((prev) => prev.filter((j) => j.job_id !== jobId));
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  }

  const isEmpty = activeList.length === 0 && expiredList.length === 0;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Saved Jobs</h1>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No saved jobs yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Browse jobs and tap the heart icon to save listings for later.
          </p>
          <Link href="/my-jobs">
            <Button size="sm" className="mt-2 bg-[#065F46] hover:bg-[#065F46]/90 text-white">
              Browse Jobs
            </Button>
          </Link>
        </div>
      )}

      {/* Active jobs */}
      {activeList.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-base font-semibold">
            Active
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({activeList.length})
            </span>
          </h2>
          <div className="space-y-3">
            {activeList.map((row) => (
              <JobCard
                key={row.job_id}
                job={rowToCardJob(row)}
                onUnsave={handleUnsave}
                isSaved={savedIds.has(row.job_id)}
                showMatchScore={row.match_score != null}
                savedAt={row.saved_at}
                isExpired={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Expired jobs */}
      {expiredList.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold">
            Expired
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({expiredList.length})
            </span>
          </h2>
          <div className="space-y-3">
            {expiredList.map((row) => (
              <JobCard
                key={row.job_id}
                job={rowToCardJob(row)}
                onUnsave={handleUnsave}
                isSaved={savedIds.has(row.job_id)}
                showMatchScore={row.match_score != null}
                savedAt={row.saved_at}
                isExpired={true}
                onRemove={handleUnsave}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
