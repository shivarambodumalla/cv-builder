import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobsContent } from "./jobs-content";
import { searchAllProviders } from "@/lib/jobs/search";
import { scoreJobsAgainstCV, detectCountryFromLocation, type ScoredJob } from "@/lib/jobs/matcher";
import type { ResumeContent } from "@/lib/resume/types";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Browse jobs matched to your CV and location preferences.",
};

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [{ data: cvs }, { data: profile }, { data: prefLocs }] = await Promise.all([
    supabase.from("cvs").select("id, title, target_role, parsed_json").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("preferred_locations_set, signup_city, signup_country").eq("id", user.id).single(),
    admin.from("preferred_locations").select("location").eq("user_id", user.id).order("priority"),
  ]);

  const cvList = (cvs ?? []).map((cv) => ({ id: cv.id, title: cv.title ?? "", target_role: cv.target_role ?? null }));
  const locations = (prefLocs ?? []).map((l) => l.location);
  const defaultCv = cvs?.[0];

  // Build search query from CV
  let searchWhat = "software engineer";
  if (defaultCv?.parsed_json) {
    const cvData = defaultCv.parsed_json as ResumeContent;
    searchWhat = defaultCv.target_role || cvData.experience?.items?.[0]?.role || "software engineer";
  }

  // Detect country from preferred locations or signup info
  let country = "us";
  const allLocs = [...locations, profile?.signup_city || "", profile?.signup_country || ""];
  for (const loc of allLocs) {
    const detected = detectCountryFromLocation(loc);
    if (detected) { country = detected; break; }
  }

  const searchWhere = locations[0] || profile?.signup_city || "";

  // Fetch from ALL enabled providers via unified search
  let initialJobs: unknown[] = [];
  try {
    const response = await searchAllProviders({
      what: searchWhat,
      where: searchWhere || undefined,
      country,
      results_per_page: 40, // fetch more — some will be filtered out by location
      sort_by: "relevance",
    });

    // Filter to preferred locations (some providers like Jooble ignore the where param)
    let filtered = response.results;
    if (locations.length > 0) {
      const prefLower = locations.map(l => l.toLowerCase());
      filtered = response.results.filter(job => {
        const jobLoc = (job.location || "").toLowerCase();
        if (jobLoc.includes("remote")) return true;
        return prefLower.some(pref =>
          jobLoc.includes(pref) || pref.includes(jobLoc) ||
          pref.split(/[\s,]+/).some((w: string) => w.length > 3 && jobLoc.includes(w))
        );
      });
      // If filtering removes everything, fall back to unfiltered
      if (filtered.length === 0) filtered = response.results;
    }

    if (filtered.length > 0 && defaultCv?.parsed_json) {
      const cvData = defaultCv.parsed_json as ResumeContent;
      const scored = scoreJobsAgainstCV(filtered, cvData, locations, country);
      initialJobs = scored.sort((a: ScoredJob, b: ScoredJob) => b.matchScore - a.matchScore);
    } else {
      initialJobs = filtered;
    }

    console.log("[my-jobs] Got", response.results.length, "raw,", filtered.length, "after location filter");
  } catch (err) {
    console.error("[my-jobs] Search failed:", err);
  }

  return (
    <JobsContent
      cvs={cvList}
      preferredLocationsSet={profile?.preferred_locations_set ?? false}
      defaultCvId={cvList[0]?.id ?? null}
      initialBestMatches={initialJobs}
      initialMoreJobs={[]}
    />
  );
}
