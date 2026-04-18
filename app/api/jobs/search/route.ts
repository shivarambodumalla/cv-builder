import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchJobsForCV, scoreJobsAgainstCV, detectCountryFromLocation } from "@/lib/jobs/matcher";
import { searchAllProviders } from "@/lib/jobs/search";
import { correctRole, correctLocation } from "@/lib/jobs/fuzzy-search";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ResumeContent } from "@/lib/resume/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const cvId = searchParams.get("cvId");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const location = searchParams.get("location") ?? "";
  const contract_type = searchParams.get("contract_type") ?? undefined;
  const salary_min = searchParams.get("salary_min")
    ? parseInt(searchParams.get("salary_min")!, 10)
    : undefined;
  const salary_max = searchParams.get("salary_max")
    ? parseInt(searchParams.get("salary_max")!, 10)
    : undefined;
  const keyword = searchParams.get("keyword") ?? undefined;
  const country = searchParams.get("country") ?? "us";

  // Fetch preferred locations from DB
  const admin = createAdminClient();
  const preferredLocations: string[] = [];
  if (location) {
    preferredLocations.push(...location.split(",").map(l => l.trim()).filter(Boolean));
  }
  if (preferredLocations.length === 0) {
    const { data: dbLocs } = await admin
      .from("preferred_locations")
      .select("location")
      .eq("user_id", user.id)
      .order("priority");
    if (dbLocs?.length) {
      preferredLocations.push(...dbLocs.map(l => l.location));
    }
  }

  // Fetch CV data if cvId provided
  let cvData: ResumeContent | null = null;
  if (cvId) {
    const { data: cv } = await supabase
      .from("cvs")
      .select("parsed_json")
      .eq("id", cvId)
      .eq("user_id", user.id)
      .single();
    if (cv) cvData = cv.parsed_json as ResumeContent;
  }

  if (cvData && preferredLocations.length === 0 && cvData.contact?.location) {
    preferredLocations.push(cvData.contact.location);
  }

  try {
    // Detect country from preferred locations
    let searchCountry = country;
    for (const loc of preferredLocations) {
      const detected = detectCountryFromLocation(loc);
      if (detected) { searchCountry = detected; break; }
    }

    // If a manual keyword search is requested, bypass the smart matcher
    if (keyword) {
      // Correct typos in keyword and location
      const correctedKeyword = correctRole(keyword);
      const correctedLocation = location ? correctLocation(location) : undefined;
      const searchLocation = correctedLocation || preferredLocations[0] || undefined;

      let results = await searchAllProviders({
        what: correctedKeyword,
        where: searchLocation,
        country: searchCountry,
        page,
        results_per_page: 20,
        contract_type,
        salary_min,
        salary_max,
      });

      // If zero results with corrected keyword, retry with original
      if (results.results.length === 0 && correctedKeyword !== keyword) {
        results = await searchAllProviders({
          what: keyword,
          where: searchLocation,
          country: searchCountry,
          page,
          results_per_page: 20,
          contract_type,
          salary_min,
          salary_max,
        });
      }

      // If still zero results and location was set, try without location
      if (results.results.length === 0 && searchLocation) {
        results = await searchAllProviders({
          what: correctedKeyword,
          country: searchCountry,
          page,
          results_per_page: 20,
          contract_type,
          salary_min,
          salary_max,
        });
      }

      // Score keyword results against the CV if available
      if (cvData) {
        const scored = scoreJobsAgainstCV(results.results, cvData, preferredLocations, searchCountry);
        const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
        return NextResponse.json({
          bestMatches: sorted,
          moreJobs: [],
          total: results.count,
          correctedKeyword: correctedKeyword !== keyword ? correctedKeyword : undefined,
          correctedLocation: correctedLocation && correctedLocation !== location ? correctedLocation : undefined,
        });
      }

      return NextResponse.json({
        bestMatches: results.results,
        moreJobs: [],
        total: results.count,
        mean: results.mean,
        correctedKeyword: correctedKeyword !== keyword ? correctedKeyword : undefined,
        correctedLocation: correctedLocation && correctedLocation !== location ? correctedLocation : undefined,
      });
    }

    // Smart matcher run (requires CV)
    if (cvData) {
      const result = await matchJobsForCV(cvData, preferredLocations, searchCountry);
      return NextResponse.json({
        bestMatches: result.bestMatches,
        moreJobs: result.moreJobs,
        total: result.total,
      });
    }

    // No CV and no keyword — use profile location data for recommendations
    const { data: profileData } = await admin
      .from("profiles")
      .select("user_city, user_country")
      .eq("id", user.id)
      .single();

    const searchWhere = preferredLocations[0]
      || profileData?.user_city
      || "remote";
    const searchCountryFallback = profileData?.user_country || searchCountry;

    const results = await searchAllProviders({
      what: "jobs",
      where: searchWhere,
      country: searchCountryFallback,
      page,
      results_per_page: 20,
      sort_by: "date",
    });

    return NextResponse.json({
      bestMatches: results.results,
      moreJobs: [],
      total: results.count,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[jobs/search]", error.message);
    return NextResponse.json(
      { error: "Job search failed. Please try again.", detail: error.message },
      { status: 502 }
    );
  }
}
