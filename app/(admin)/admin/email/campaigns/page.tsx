import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { CampaignManager } from "./campaign-manager";
import { JOBS_TEMPLATES } from "@/lib/email/system-templates";

export const metadata: Metadata = { title: "Campaigns | CVEdge Admin" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const supabase = createAdminClient();
  const [{ data: campaigns }, { data: templates }] = await Promise.all([
    supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("email_templates").select("name").eq("enabled", true),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Campaigns</h1>
      <CampaignManager
        campaigns={campaigns ?? []}
        templateNames={(templates ?? []).map((t) => t.name)}
        jobsTemplateNames={[...JOBS_TEMPLATES]}
      />
    </div>
  );
}
