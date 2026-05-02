import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CvReviewNewForm } from "@/components/cv-review/new-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Review by Experts — CVEdge" };

export default async function CvReviewNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/cv-review/new");
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-6">
        <Link href="/cv-review" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Review by Experts
        </Link>
        <h1 className="text-2xl font-bold mt-2">Review by Experts</h1>
      </div>
      <CvReviewNewForm />
    </div>
  );
}
