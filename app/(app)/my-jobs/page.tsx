import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobsContent } from "./jobs-content";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Browse jobs matched to your CV and location preferences.",
};

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ cvId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=%2Fmy-jobs");

  const admin = createAdminClient();
  const { cvId: requestedCvId } = await searchParams;

  // Only fetch lightweight DB data — no external API calls
  const [{ data: cvs }, { data: profile }, { data: prefLocs }] = await Promise.all([
    supabase.from("cvs").select("id, title, target_role").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("preferred_locations_set").eq("id", user.id).single(),
    admin.from("preferred_locations").select("location").eq("user_id", user.id).order("priority"),
  ]);

  const cvList = (cvs ?? []).map((cv) => ({ id: cv.id, title: cv.title ?? "", target_role: cv.target_role ?? null }));

  // Resolve which CV is the "active" one (URL param wins, then most-recent)
  const activeCvId = requestedCvId && cvList.some((c) => c.id === requestedCvId)
    ? requestedCvId
    : cvList[0]?.id ?? null;

  // If we came in via ?cvId=, also extract role + location from the CV so the
  // search inputs are visibly prefilled (matcher already uses the CV server-side,
  // but users want to *see* what we're searching for).
  let defaultKeyword = "";
  let defaultLocations: string[] = [];
  if (requestedCvId && activeCvId === requestedCvId) {
    const { data: cvData } = await supabase
      .from("cvs")
      .select("target_role, parsed_json")
      .eq("id", requestedCvId)
      .eq("user_id", user.id)
      .single();
    if (cvData) {
      const parsed = cvData.parsed_json as { contact?: { location?: string }; targetTitle?: { title?: string } } | null;
      defaultKeyword = (cvData.target_role || parsed?.targetTitle?.title || "").trim();
      const cvLocation = parsed?.contact?.location?.trim();
      if (cvLocation) defaultLocations = [cvLocation];
    }
  }

  return (
    <JobsContent
      cvs={cvList}
      preferredLocationsSet={profile?.preferred_locations_set ?? false}
      defaultCvId={activeCvId}
      defaultKeyword={defaultKeyword}
      defaultLocations={defaultLocations}
      initialBestMatches={[]}
      initialMoreJobs={[]}
    />
  );
}
