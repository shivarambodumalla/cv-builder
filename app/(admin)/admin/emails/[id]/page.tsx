import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { EmailEditor } from "./email-editor";

export const metadata: Metadata = { title: "Edit Template — CVEdge Admin" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEmailPage({ params: paramsPromise }: Props) {
  const params = await paramsPromise;
  const supabase = createAdminClient();

  const [{ data: template }, { data: brand }] = await Promise.all([
    supabase.from("email_templates").select("*").eq("id", params.id).single(),
    supabase.from("brand_settings").select("*").limit(1).single(),
  ]);

  if (!template) notFound();

  return (
    <EmailEditor
      template={template}
      brand={brand ?? { id: "", primary_color: "#0D9488", logo_text: "CVEdge", support_email: "hello@thecvedge.com", app_url: "https://www.thecvedge.com" }}
    />
  );
}
