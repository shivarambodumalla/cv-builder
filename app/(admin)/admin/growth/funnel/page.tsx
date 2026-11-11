import type { Metadata } from "next";
import { FunnelDashboard } from "./funnel-dashboard";

export const metadata: Metadata = { title: "Funnel · Growth" };
export const dynamic = "force-dynamic";

export default function GrowthFunnelPage() {
  return <FunnelDashboard />;
}
