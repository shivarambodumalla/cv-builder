import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CvList } from "@/components/shared/cv-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cvs } = await supabase
    .from("cvs")
    .select("id, title, created_at, ats_reports(score)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-12">
      <CvList cvs={cvs ?? []} />
    </div>
  );
}
