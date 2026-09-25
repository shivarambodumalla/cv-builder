import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRatingStats, MIN_PUBLIC_RATINGS } from "@/lib/feedback/stats";
import { FeedbackTable, type FeedbackRow } from "./feedback-table";

export const metadata: Metadata = {
  title: "Feedback & Ratings | CVEdge Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const admin = createAdminClient();
  const [stats, { data: rows }] = await Promise.all([
    getRatingStats(),
    admin
      .from("feedback")
      .select("id, user_id, cv_id, rating, comment, source, can_publish, status, testimonial_id, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id as string)));
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, email, full_name, user_number, plan").in("id", userIds)
    : { data: [] };
  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  const feedback: FeedbackRow[] = (rows ?? []).map((r) => {
    const p = byId.get(r.user_id as string);
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: (r.comment as string | null) ?? null,
      source: r.source as "popup" | "email",
      can_publish: r.can_publish as boolean,
      status: r.status as FeedbackRow["status"],
      created_at: r.created_at as string,
      email: (p?.email as string | null) ?? null,
      full_name: (p?.full_name as string | null) ?? null,
      user_number: (p?.user_number as number | null) ?? null,
      plan: (p?.plan as string | null) ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedback & Ratings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ratings collected after PDF downloads (in-app prompt + next-day email). The homepage shows the average and
          emits AggregateRating only once there are {MIN_PUBLIC_RATINGS} or more. Publishing a consented comment adds it to the testimonials carousel.
        </p>
      </div>
      <FeedbackTable rows={feedback} stats={stats} minPublic={MIN_PUBLIC_RATINGS} />
    </div>
  );
}
