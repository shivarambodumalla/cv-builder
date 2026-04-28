import type { Metadata } from "next";
import { BlogAnalyticsDashboard } from "./blog-analytics-dashboard";

export const metadata: Metadata = { title: "Blog Analytics | Admin" };
export const dynamic = "force-dynamic";

export default function BlogAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blog Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Page views per post and link click traction.</p>
      </div>
      <BlogAnalyticsDashboard />
    </div>
  );
}
