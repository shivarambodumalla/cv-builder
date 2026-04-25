import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { EmailManager } from "./email-manager";
import { JOBS_TEMPLATES, JOBS_TEMPLATE_DESCRIPTIONS } from "@/lib/email/system-templates";

export const metadata: Metadata = { title: "Emails | CVEdge Admin" };
export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const supabase = createAdminClient();
  const [{ data: templates }, { data: brand }] = await Promise.all([
    supabase.from("email_templates").select("*").order("name"),
    supabase.from("brand_settings").select("*").limit(1).single(),
  ]);

  const codeTemplates = JOBS_TEMPLATES.map((name) => ({
    name,
    description: JOBS_TEMPLATE_DESCRIPTIONS[name],
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Email Templates</h1>
      <EmailManager
        templates={templates ?? []}
        codeTemplates={codeTemplates}
        brand={brand ?? { id: "", primary_color: "#0D9488", logo_text: "CVEdge", support_email: "hello@thecvedge.com", app_url: "https://www.thecvedge.com" }}
      />
    </div>
  );
}
