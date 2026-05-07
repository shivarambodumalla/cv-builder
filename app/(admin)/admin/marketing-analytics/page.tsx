import type { Metadata } from "next";
import { MarketingDashboard } from "./marketing-dashboard";

export const metadata: Metadata = { title: "Marketing Analytics | Admin" };
export const dynamic = "force-dynamic";

export default function MarketingAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Google Search Console keywords, page rankings, and GA4 traffic channels.
        </p>
      </div>
      <MarketingDashboard />
    </div>
  );
}
