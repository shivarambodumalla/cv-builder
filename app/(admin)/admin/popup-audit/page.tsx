import type { Metadata } from "next";
import { PopupAudit } from "./popup-audit";

export const metadata: Metadata = { title: "Popup Audit | Admin" };

export default function PopupAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Popup & Nudge Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Preview all popups, verify designs, and check trigger conditions.</p>
      </div>
      <PopupAudit />
    </div>
  );
}
