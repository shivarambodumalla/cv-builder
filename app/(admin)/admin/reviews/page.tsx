import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewsQueue } from "./reviews-queue";

export const metadata: Metadata = { title: "CV Reviews — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const admin = createAdminClient();

  const { data: reviews } = await admin
    .from("cv_reviews")
    .select("id, user_id, tier, status, target_role, target_country, edit_rounds_used, edit_rounds_limit, price_paid, created_at")
    .order("status")
    .order("created_at", { ascending: true });

  // Fetch user profiles for all reviews
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await admin.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const enriched = (reviews ?? []).map((r) => ({
    ...r,
    profile: profileMap[r.user_id] ?? null,
  }));

  const stats = {
    pending: enriched.filter((r) => r.status === "pending").length,
    in_progress: enriched.filter((r) => r.status === "in_progress").length,
    completed: enriched.filter((r) => r.status === "completed").length,
    total_revenue: enriched.reduce((s, r) => s + Number(r.price_paid ?? 0), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CV Reviews</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border p-4">
          <div className="text-2xl font-bold" style={{ color: "#92400E" }}>{stats.pending}</div>
          <div className="text-sm text-muted-foreground mt-1">Pending</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-2xl font-bold" style={{ color: "#1D4ED8" }}>{stats.in_progress}</div>
          <div className="text-sm text-muted-foreground mt-1">In progress</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-2xl font-bold" style={{ color: "#065F46" }}>{stats.completed}</div>
          <div className="text-sm text-muted-foreground mt-1">Completed</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-2xl font-bold">${stats.total_revenue.toFixed(0)}</div>
          <div className="text-sm text-muted-foreground mt-1">Total revenue</div>
        </div>
      </div>

      <ReviewsQueue reviews={enriched} />
    </div>
  );
}
