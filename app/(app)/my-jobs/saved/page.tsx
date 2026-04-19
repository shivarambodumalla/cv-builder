import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavedJobsContent } from "./saved-jobs-content";

export const metadata: Metadata = {
  title: "Saved Jobs",
  description: "View and manage your saved job listings.",
};

export const dynamic = "force-dynamic";

interface SavedJob {
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

export default async function SavedJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnUrl=%2Fmy-jobs%2Fsaved");

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("id, job_id, job_title, company, location, salary_min, salary_max, redirect_url, match_score, job_board, status, saved_at")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  const jobs = (savedJobs ?? []) as SavedJob[];

  const activeJobs = jobs.filter((j) => j.status !== "expired");
  const expiredJobs = jobs.filter((j) => j.status === "expired");

  return (
    <SavedJobsContent
      activeJobs={activeJobs}
      expiredJobs={expiredJobs}
    />
  );
}
