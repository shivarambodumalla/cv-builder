import { createAdminClient } from "@/lib/supabase/admin";

export async function PendingReviewCount() {
  const admin = createAdminClient();
  const { count } = await admin
    .from("cv_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (!count || count === 0) return null;

  return (
    <span
      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
      style={{ background: "#DC2626" }}
    >
      {count}
    </span>
  );
}
