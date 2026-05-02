import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Review by Experts — History | CVEdge" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "Awaiting review", bg: "#FEF3C7", color: "#92400E" },
  in_progress: { label: "In progress", bg: "#EFF6FF", color: "#1D4ED8" },
  completed: { label: "Complete", bg: "#F0FDF4", color: "#065F46" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#991B1B" },
};

export default async function CvReviewHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/cv-review/history");

  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("cv_reviews")
    .select("id, tier, status, target_role, edit_rounds_used, edit_rounds_limit, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-1">Review by Experts — History</h1>
        </div>
        <Link
          href="/cv-review/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#065F46" }}
        >
          New review
        </Link>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">No reviews yet.</p>
          <Link
            href="/cv-review/new"
            className="inline-block px-5 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#065F46" }}
          >
            Request your first review
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const st = STATUS_LABELS[review.status] ?? STATUS_LABELS.pending;
            const remaining =
              review.edit_rounds_limit === 999
                ? "Unlimited rounds"
                : `${Math.max(0, review.edit_rounds_limit - review.edit_rounds_used)} rounds left`;
            return (
              <Link
                key={review.id}
                href={`/cv-review/${review.id}`}
                className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm capitalize">{review.tier} Review</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </div>
                  {review.target_role && (
                    <p className="text-xs text-muted-foreground">{review.target_role}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(review.created_at).toLocaleDateString()} · {remaining}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">View →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
