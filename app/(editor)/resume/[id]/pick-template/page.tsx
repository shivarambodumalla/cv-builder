import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplatePicker } from "./template-picker";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PickTemplatePage({ params: paramsPromise }: Props) {
  const params = await paramsPromise;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?returnUrl=${encodeURIComponent(`/resume/${params.id}/pick-template`)}`);
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, title, design_settings")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    notFound();
  }

  // Short-circuit: if a template was already chosen (e.g. via ?template= URL
  // param on the landing page), skip straight to the editor.
  const existingTemplate = (cv.design_settings as { template?: string } | null)?.template;
  if (existingTemplate) {
    redirect(`/resume/${params.id}`);
  }

  return <TemplatePicker cvId={cv.id} title={cv.title ?? null} />;
}
