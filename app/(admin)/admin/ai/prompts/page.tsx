import { createAdminClient } from "@/lib/supabase/admin";
import { PromptsManager } from "./prompts-manager";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("prompts").select("*").order("name");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Prompts</h1>
      <PromptsManager prompts={data ?? []} />
    </div>
  );
}
