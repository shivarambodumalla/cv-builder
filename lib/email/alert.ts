import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim()).filter(Boolean);

/** Fire-and-forget admin email. Production only — never noise in dev. */
export function sendAdminEmail(subject: string, html: string): void {
  if (process.env.NEXT_PUBLIC_ENV !== "production") return;
  if (ADMIN_EMAILS.length === 0) return;

  resend.emails.send({
    from: "CVEdge Alerts <hello@thecvedge.com>",
    to: ADMIN_EMAILS,
    subject,
    html,
  }).catch((err) => console.error("[alert] Failed to send admin alert:", err));
}

export function alertAdmin(feature: string, error: string, context?: Record<string, string>): void {
  const contextLines = context
    ? Object.entries(context).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "";

  sendAdminEmail(
    `[CVEdge] ${feature} failed`,
    `
      <h2 style="color:#DC2626;margin:0 0 8px">Critical: ${feature} failed</h2>
      <p style="color:#666;font-size:14px">${new Date().toISOString()}</p>
      <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto">${error}</pre>
      ${contextLines ? `<pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;margin-top:8px">${contextLines}</pre>` : ""}
      <p style="color:#999;font-size:11px;margin-top:16px">This is an automated alert from CVEdge production.</p>
    `
  );
}
