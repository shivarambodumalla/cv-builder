import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExtractContent } from "./extract-content";

export default async function ExtractPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cvs } = await supabase
    .from("cvs")
    .select("id, title, target_role")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <ExtractContent cvs={cvs ?? []} />;
}
