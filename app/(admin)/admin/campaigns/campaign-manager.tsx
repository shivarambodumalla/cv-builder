"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SEGMENTS = [
  { value: "custom_emails", label: "Custom email list" },
  { value: "never_uploaded", label: "Never uploaded CV" },
  { value: "free_active_upgrade", label: "Free users" },
  { value: "all_users", label: "All users" },
  { value: "paid_users", label: "Paid users only" },
];

interface Campaign {
  id: string;
  name: string;
  template_name: string;
  segment: string;
  status: string;
  sent_count: number;
  sent_at: string | null;
  created_at: string;
}

export function CampaignManager({
  campaigns,
  templateNames,
  jobsTemplateNames = [],
}: {
  campaigns: Campaign[];
  templateNames: string[];
  jobsTemplateNames?: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [templateName, setTemplateName] = useState(templateNames[0] ?? jobsTemplateNames[0] ?? "");
  const [segment, setSegment] = useState(SEGMENTS[0].value);
  const [customEmails, setCustomEmails] = useState("");
  const [sending, setSending] = useState(false);

  const isJobsTemplate = jobsTemplateNames.includes(templateName);
  const customEmailsBlocked = isJobsTemplate && segment === "custom_emails";

  async function handleSend() {
    if (!name.trim() || !templateName) return;
    if (segment === "custom_emails" && !customEmails.trim()) return;
    if (customEmailsBlocked) return;
    setSending(true);
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        templateName,
        segment,
        sendNow: true,
        customEmails: segment === "custom_emails" ? customEmails : undefined,
      }),
    });
    setSending(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || `Send failed (${res.status})`);
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <>
      {/* Create campaign */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-semibold">Send Campaign</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="April reactivation" />
          </div>
          <div>
            <Label className="text-xs">Template</Label>
            <select value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              {templateNames.length > 0 && (
                <optgroup label="Editable templates">
                  {templateNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
              )}
              {jobsTemplateNames.length > 0 && (
                <optgroup label="Jobs (code-rendered, per-user)">
                  {jobsTemplateNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
              )}
            </select>
            {isJobsTemplate && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Each recipient gets their own matched jobs. Suppression list, opt-outs, and dedup all apply.
              </p>
            )}
          </div>
          <div>
            <Label className="text-xs">Segment</Label>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        {segment === "custom_emails" && (
          <div>
            <Label className="text-xs">Email addresses (comma-separated)</Label>
            <Textarea
              value={customEmails}
              onChange={(e) => setCustomEmails(e.target.value)}
              placeholder="user1@example.com, user2@example.com"
              rows={3}
              className="text-sm"
            />
            {customEmailsBlocked && (
              <p className="mt-1 text-[11px] text-error">
                Jobs templates need a real account (CV + locations). Pick a user segment instead.
              </p>
            )}
          </div>
        )}
        <Button onClick={handleSend} disabled={sending || !name.trim() || (segment === "custom_emails" && !customEmails.trim()) || customEmailsBlocked}>
          {sending ? "Sending..." : "Send Now"}
        </Button>
      </div>

      {/* Campaign history */}
      <div className="overflow-x-auto">
        <h2 className="text-sm font-semibold mb-3">Campaign History</h2>
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Name</th>
              <th className="pb-2">Template</th>
              <th className="pb-2">Segment</th>
              <th className="pb-2 text-right">Sent</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 font-medium">{c.name}</td>
                <td className="py-2">{c.template_name}</td>
                <td className="py-2">{c.segment}</td>
                <td className="py-2 text-right">{c.sent_count}</td>
                <td className="py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${c.status === "sent" ? "bg-success/15 text-success" : c.status === "sending" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-2 text-muted-foreground">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No campaigns yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
