import type { Metadata } from "next";
import { InterventionsDashboard } from "./interventions-dashboard";
import { PopupAudit } from "./popup-audit";
import { PaywallConversion } from "./paywall-conversion";
import { resolveRange } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "Paywall & popups · Growth" };

export const dynamic = "force-dynamic";

export default function GrowthPaywallPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="space-y-10">
      <section>
        <PaywallConversion range={resolveRange(searchParams, "30d")} />
      </section>
      <section className="space-y-4 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Popups and nudges</h2>
          <p className="text-sm text-muted-foreground mt-1">Every signup modal, popover and nudge: shown, clicked, dismissed.</p>
        </div>
        <InterventionsDashboard />
      </section>
      <section className="space-y-4 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Popup inventory</h2>
          <p className="text-sm text-muted-foreground mt-1">Preview each popup and check when it triggers.</p>
        </div>
        <PopupAudit />
      </section>
    </div>
  );
}
