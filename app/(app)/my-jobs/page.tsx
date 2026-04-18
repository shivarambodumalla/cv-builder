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

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Only fetch lightweight DB data — no external API calls
  const [{ data: cvs }, { data: profile }, { data: prefLocs }] = await Promise.all([
    supabase.from("cvs").select("id, title, target_role").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("preferred_locations_set").eq("id", user.id).single(),
    admin.from("preferred_locations").select("location").eq("user_id", user.id).order("priority"),
  ]);

  const cvList = (cvs ?? []).map((cv) => ({ id: cv.id, title: cv.title ?? "", target_role: cv.target_role ?? null }));

  return (
    <JobsContent
      cvs={cvList}
      preferredLocationsSet={profile?.preferred_locations_set ?? false}
      defaultCvId={cvList[0]?.id ?? null}
      initialBestMatches={[]}
      initialMoreJobs={[]}
    />
  );
}
