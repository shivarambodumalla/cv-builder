import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CvReviewNewForm } from "@/components/cv-review/new-form";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ShieldCheck, Zap, RotateCcw } from "lucide-react";

export const metadata: Metadata = { title: "Get Your CV Reviewed — CVEdge" };

export default async function CvReviewNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=/cv-review/new");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">

        {/* Back link */}
        <Link
          href="/cv-review"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Expert Review
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Get your CV reviewed</h1>
          <p className="text-muted-foreground">A real industry specialist will personally review and rewrite your CV in 24 hours.</p>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> 80+ ATS guarantee</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> 24-hr turnaround</span>
          <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-primary" /> Revision rounds included</span>
        </div>

        <CvReviewNewForm />
      </div>
    </div>
  );
}
