import { NextResponse } from "next/server";
import { reconcileSubscriptions, type Discrepancy } from "@/lib/billing/reconcile";
import { sendAdminEmail, alertAdmin } from "@/lib/email/alert";

const LABELS: Record<Discrepancy["kind"], string> = {
  not_activated: "Paid but not activated",
  orphaned_payment: "Payment with no account",
  over_granted: "Pro locally, not paying upstream",
};

const COLORS: Record<Discrepancy["kind"], string> = {
  not_activated: "#D97706",
  orphaned_payment: "#DC2626",
  over_granted: "#D97706",
};

function buildReport(checked: number, discrepancies: Discrepancy[]): string {
  const rows = discrepancies.map((d) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;color:${COLORS[d.kind]};font-weight:600">${LABELS[d.kind]}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${d.email || "—"}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px">${d.subscriptionId || "—"}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${d.healed ? "Auto-fixed" : "Needs you"}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px">${d.detail}</td>
    </tr>`).join("");

  return `
    <h2 style="margin:0 0 8px">Subscription reconciliation</h2>
    <p style="color:#666;font-size:14px">${checked} active subscription(s) checked upstream · ${discrepancies.length} discrepancy(ies) found</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <tr style="text-align:left;background:#f5f5f5">
        <th style="padding:8px">Issue</th><th style="padding:8px">Email</th>
        <th style="padding:8px">Subscription</th><th style="padding:8px">Status</th><th style="padding:8px">Detail</th>
      </tr>
      ${rows}
    </table>
    <p style="color:#999;font-size:11px;margin-top:16px">Automated daily check from CVEdge production.</p>`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checked, discrepancies } = await reconcileSubscriptions();

    if (discrepancies.length > 0) {
      sendAdminEmail(
        `[CVEdge] ${discrepancies.length} subscription discrepancy(ies)`,
        buildReport(checked, discrepancies)
      );
    }

    console.log(`[reconcile] checked=${checked} discrepancies=${discrepancies.length}`);
    return NextResponse.json({ checked, discrepancies });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[reconcile] failed:", msg);
    // A silent reconciliation failure defeats the point of having one.
    alertAdmin("Subscription reconciliation", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
