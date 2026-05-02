import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewConversation } from "@/components/cv-review/review-conversation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Review by Experts — CVEdge" };
export const dynamic = "force-dynamic";

export default async function CvReviewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnUrl=/cv-review/${params.id}`);

  const admin = createAdminClient();
  const { data: review } = await admin
    .from("cv_reviews")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!review) notFound();

  const { data: messages } = await admin
    .from("cv_review_messages")
    .select("*")
    .eq("review_id", params.id)
    .order("created_at", { ascending: true });

  const { data: latestCv } = await admin
    .from("cvs")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-4">
        <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Dashboard
        </a>
      </div>
      <ReviewConversation review={review} initialMessages={messages ?? []} editorCvId={latestCv?.id ?? null} />
    </div>
  );
}
