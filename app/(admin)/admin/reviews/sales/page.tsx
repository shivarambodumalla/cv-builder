import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CvReviewDashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "CV Review Analytics",
};

export default async function CvReviewAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">CV Review Funnel & Sales</h2>
        <p className="text-muted-foreground text-sm mt-1">
          End-to-end sales funnel: page views → CTA → checkout → purchase. Revenue from DB, top-of-funnel from GA4.
        </p>
      </div>
      <CvReviewDashboard />
    </div>
  );
}
