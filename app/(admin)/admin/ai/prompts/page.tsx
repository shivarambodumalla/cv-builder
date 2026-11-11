import { createAdminClient } from "@/lib/supabase/admin";
import { PromptsManager } from "./prompts-manager";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("prompts").select("*").order("name");

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Prompts</h2>
      <PromptsManager prompts={data ?? []} />
    </div>
  );
}
