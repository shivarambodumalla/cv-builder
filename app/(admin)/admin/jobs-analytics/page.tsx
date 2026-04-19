import type { Metadata } from "next";
import { JobsAnalyticsDashboard } from "./jobs-analytics-dashboard";

export const metadata: Metadata = { title: "Jobs Analytics | Admin" };

export default function JobsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Job search, clicks, saves, revenue, and provider performance.</p>
      </div>
      <JobsAnalyticsDashboard />
    </div>
  );
}
