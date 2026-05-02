import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { AdminReviewEditor } from "./admin-review-editor";

export const metadata: Metadata = { title: "Review Detail — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReviewDetailPage({ params }: { params: { reviewId: string } }) {
  const admin = createAdminClient();

  const { data: review } = await admin
    .from("cv_reviews")
    .select("*")
    .eq("id", params.reviewId)
    .single();

  if (!review) notFound();

  const [{ data: messages }, { data: files }, { data: suggestions }, { data: profile }] = await Promise.all([
    admin.from("cv_review_messages").select("*").eq("review_id", params.reviewId).order("created_at", { ascending: true }),
    admin.from("cv_review_files").select("*").eq("review_id", params.reviewId).order("version_number", { ascending: true }),
    admin.from("cv_review_suggestions").select("*").eq("review_id", params.reviewId).order("created_at", { ascending: true }),
    admin.from("profiles").select("full_name, email, plan").eq("id", review.user_id).single(),
  ]);

  return (
    <AdminReviewEditor
      review={review}
      messages={messages ?? []}
      files={files ?? []}
      suggestions={suggestions ?? []}
      profile={profile}
    />
  );
}
