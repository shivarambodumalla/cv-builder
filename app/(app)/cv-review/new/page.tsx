import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CvReviewNewForm } from "@/components/cv-review/new-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Request Expert CV Review — CVEdge" };

export default async function CvReviewNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/cv-review/new");
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-6">
        <a href="/cv-review" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← CV Review
        </a>
        <h1 className="text-2xl font-bold mt-2">Request expert CV review</h1>
      </div>
      <CvReviewNewForm />
    </div>
  );
}
