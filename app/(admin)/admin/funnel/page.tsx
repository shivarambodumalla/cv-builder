import type { Metadata } from "next";
import { FunnelDashboard } from "./funnel-dashboard";

export const metadata: Metadata = { title: "Funnel | CVEdge Admin" };
export const dynamic = "force-dynamic";

export default function FunnelPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Funnel</h1>
      <FunnelDashboard />
    </div>
  );
}
