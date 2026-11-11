import type { Metadata } from "next";
import { Suspense } from "react";
import { ListSkeleton, TilesSkeleton } from "@/components/admin/home/block";
import { FunnelDashboard } from "./funnel-dashboard";
import { FunnelCharts } from "./funnel-charts";

export const metadata: Metadata = { title: "Funnel · Growth" };
export const dynamic = "force-dynamic";

export default function GrowthFunnelPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Last 30 days</h2>
          <p className="mt-1 text-sm text-muted-foreground">Registrations, the payment wall and engagement, by UTC day.</p>
        </div>
        <Suspense
          fallback={
            <div className="space-y-4">
              <ListSkeleton rows={3} />
              <TilesSkeleton />
            </div>
          }
        >
          <FunnelCharts />
        </Suspense>
      </section>
      <section className="border-t pt-8">
        <FunnelDashboard />
      </section>
    </div>
  );
}
