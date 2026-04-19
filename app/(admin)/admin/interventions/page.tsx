import type { Metadata } from "next";
import { InterventionsDashboard } from "./interventions-dashboard";

export const metadata: Metadata = { title: "Interventions | Admin" };

export default function InterventionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interventions</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all signup modals, popovers, and nudges — shown, clicked, dismissed.</p>
      </div>
      <InterventionsDashboard />
    </div>
  );
}
