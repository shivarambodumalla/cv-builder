import type { Metadata } from "next";
import { MarketingDashboard } from "./marketing-dashboard";
import { BlogAnalyticsDashboard } from "./blog-analytics-dashboard";
import { SignupsByChannel } from "./signups-by-channel";
import { resolveRange } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "Traffic · Growth" };
export const dynamic = "force-dynamic";

export default function GrowthTrafficPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="space-y-10">
      <section>
        <SignupsByChannel range={resolveRange(searchParams)} />
      </section>
      <section className="space-y-4 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Search and channels</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Search Console keywords and pages, GA4 traffic channels, and Bing Webmaster data.
          </p>
        </div>
        <MarketingDashboard />
      </section>
      <section className="space-y-4 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Blog</h2>
          <p className="text-sm text-muted-foreground mt-1">Views per post and link clicks.</p>
        </div>
        <BlogAnalyticsDashboard />
      </section>
    </div>
  );
}
