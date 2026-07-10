"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, Flame, MessageSquare } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  experience_level: string | null;
  status: string;
  score: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  owner_admin_email: string | null;
  tags: string[];
  consent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  event: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const STATUSES = [
  "new", "viewed_curriculum", "downloaded_curriculum", "call_booked",
  "applied", "interview", "enrolled", "rejected", "lost",
] as const;

const EVENT_LABELS: Record<string, string> = {
  viewed_curriculum: "Viewed curriculum",
  downloaded_pdf: "Downloaded curriculum PDF",
  viewed_pricing: "Viewed pricing",
  booked_call: "Booked a call",
  call_completed: "Call completed",
  whatsapp_sent: "WhatsApp message sent",
  reminder_sent: "Reminder sent",
  clicked_email: "Clicked email",
  paid: "Paid",
  note_added: "Note",
  status_changed: "Status changed",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function LeadDetail({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchLead = useCallback(async () => {
    const res = await fetch(`/api/admin/mentorship/leads/${leadId}`);
    if (!res.ok) {
      setError(`Failed to load lead (${res.status})`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLead(data.lead);
    setActivities(data.activities);
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const changeStatus = async (status: string) => {
    if (!lead || status === lead.status) return;
    setSavingStatus(true);
    const res = await fetch(`/api/admin/mentorship/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSavingStatus(false);
    if (res.ok) fetchLead();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    const res = await fetch(`/api/admin/mentorship/leads/${leadId}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setSavingNote(false);
    if (res.ok) {
      setNote("");
      fetchLead();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-error">{error || "Lead not found"}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/mentorship/leads">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to leads
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/mentorship/leads"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All leads
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {lead.name}
            {lead.score >= 100 && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-warning">
                <Flame className="w-4 h-4" /> Hot lead
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">{lead.email}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{lead.score}</div>
          <div className="text-xs text-muted-foreground">Lead score</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: details + status */}
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 bg-card space-y-3">
            <h2 className="text-sm font-semibold">Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{lead.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Country</dt>
                <dd>{lead.country_code || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Experience</dt>
                <dd>{lead.experience_level || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Source</dt>
                <dd>{lead.utm_source || "direct"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Campaign</dt>
                <dd>{lead.utm_campaign || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Consent</dt>
                <dd>{lead.consent_at ? fmtDate(lead.consent_at) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{fmtDate(lead.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Owner</dt>
                <dd>{lead.owner_admin_email || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-border rounded-lg p-4 bg-card space-y-3">
            <h2 className="text-sm font-semibold">Status</h2>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={savingStatus}
                  onClick={() => changeStatus(s)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50",
                    lead.status === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 bg-card space-y-3">
            <h2 className="text-sm font-semibold">Add Note</h2>
            <Input
              placeholder="Write a note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <Button size="sm" onClick={addNote} disabled={savingNote || !note.trim()}>
              {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save note"}
            </Button>
          </div>
        </div>

        {/* Right: timeline */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-sm font-semibold mb-4">Activity Timeline</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {activities.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <div className="w-px flex-1 bg-border" />
                    </div>
                    <div className="pb-2 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {a.event === "note_added" && <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />}
                        {EVENT_LABELS[a.event] || a.event}
                      </div>
                      {a.event === "note_added" && typeof a.metadata?.note === "string" && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {a.metadata.note}
                        </p>
                      )}
                      {a.event === "status_changed" && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {String(a.metadata?.from).replace(/_/g, " ")} → {String(a.metadata?.to).replace(/_/g, " ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(a.created_at)}
                        {typeof a.metadata?.by === "string" ? ` · ${a.metadata.by}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
