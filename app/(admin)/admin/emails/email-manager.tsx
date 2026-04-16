"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Pencil, Check, X, Plus, Copy, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  heading: string;
  subheading: string;
  cta_text: string | null;
  cta_url: string | null;
  body_html: string | null;
  after_cta_html: string | null;
  custom_html: string | null;
  enabled: boolean;
}

interface Brand {
  id: string;
  primary_color: string;
  logo_text: string;
  support_email: string;
  app_url: string;
}

// System templates cannot be deleted
const SYSTEM_TEMPLATES = ["welcome", "upgrade_prompt", "reactivation", "inactive_user", "limit_reset", "subscription_suspended"];

type CreateMode = "empty" | "html" | "clone";

export function EmailManager({ templates: initial, brand: initialBrand }: { templates: Template[]; brand: Brand }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initial);
  const [brand, setBrand] = useState(initialBrand);
  const [brandSaving, setBrandSaving] = useState(false);
  const [testSending, setTestSending] = useState<string | null>(null);

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("empty");
  const [cloneSource, setCloneSource] = useState<Template | null>(null);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCustomHtml, setNewCustomHtml] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  function resetCreate() {
    setShowCreate(false);
    setCreateMode("empty");
    setCloneSource(null);
    setNewName("");
    setNewSubject("");
    setNewCustomHtml("");
    setCreateError("");
  }

  function startClone(t: Template) {
    setShowCreate(true);
    setCreateMode("clone");
    setCloneSource(t);
    setNewName(`${t.name}_copy`);
    setNewSubject(t.subject);
    setNewCustomHtml("");
    setCreateError("");
  }

  async function saveBrand() {
    setBrandSaving(true);
    const res = await fetch("/api/admin/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Save failed: ${data.error || res.statusText}`);
    }
    setBrandSaving(false);
    router.refresh();
  }

  async function toggleEnabled(t: Template) {
    const updated = { ...t, enabled: !t.enabled };
    const res = await fetch("/api/admin/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    }
  }

  async function handleCreate() {
    const name = newName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) { setCreateError("Name is required"); return; }

    setCreating(true);
    setCreateError("");

    const payload: Record<string, unknown> = { action: "create", name, subject: newSubject || name };

    if (createMode === "clone" && cloneSource) {
      payload.heading = cloneSource.heading;
      payload.subheading = cloneSource.subheading;
      payload.cta_text = cloneSource.cta_text;
      payload.cta_url = cloneSource.cta_url;
      payload.body_html = cloneSource.body_html;
      payload.after_cta_html = cloneSource.after_cta_html;
      payload.custom_html = cloneSource.custom_html;
    } else if (createMode === "html") {
      payload.custom_html = newCustomHtml || null;
    }
    // "empty" mode sends nothing extra — blank template

    const res = await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setCreateError(data.error || `Create failed (${res.status})`);
      return;
    }

    if (data.id) {
      resetCreate();
      router.push(`/admin/emails/${data.id}`);
    }
  }

  async function handleDelete(t: Template) {
    if (!confirm(`Delete template "${t.name}"? This cannot be undone.`)) return;
    setDeleting(t.id);
    const res = await fetch("/api/admin/emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id }),
    });
    setDeleting(null);
    if (res.ok) {
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`Delete failed: ${data.error || res.statusText}`);
    }
  }

  async function sendTest(name: string) {
    setTestSending(name);
    await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateName: name }),
    });
    setTestSending(null);
  }

  return (
    <>
      {/* Brand settings */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-sm font-semibold">Brand Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Primary Color</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={brand.primary_color} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="h-9 w-12 rounded border cursor-pointer" />
              <Input value={brand.primary_color} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="flex-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Logo Text</Label>
            <Input value={brand.logo_text} onChange={(e) => setBrand({ ...brand, logo_text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Support Email</Label>
            <Input value={brand.support_email} onChange={(e) => setBrand({ ...brand, support_email: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">App URL</Label>
            <Input value={brand.app_url} onChange={(e) => setBrand({ ...brand, app_url: e.target.value })} />
          </div>
        </div>
        <Button size="sm" onClick={saveBrand} disabled={brandSaving}>
          {brandSaving ? "Saving..." : "Save Brand"}
        </Button>
      </div>

      {/* Create template */}
      {!showCreate ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowCreate(true); setCreateMode("empty"); }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Template
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {createMode === "clone" ? `Clone: ${cloneSource?.name}` : "New Template"}
            </h2>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetCreate}>Cancel</Button>
          </div>

          {/* Mode tabs — only show if not cloning */}
          {createMode !== "clone" && (
            <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
              <button
                onClick={() => setCreateMode("empty")}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${createMode === "empty" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Empty template
              </button>
              <button
                onClick={() => setCreateMode("html")}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${createMode === "html" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
              >
                Paste HTML
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Template Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. april_launch" />
              <p className="text-[10px] text-muted-foreground mt-1">Lowercase, underscores. Must be unique.</p>
            </div>
            <div>
              <Label className="text-xs">Subject Line</Label>
              <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Big news from CVEdge" />
            </div>
          </div>

          {createMode === "html" && (
            <div>
              <Label className="text-xs">Custom HTML</Label>
              <Textarea
                value={newCustomHtml}
                onChange={(e) => setNewCustomHtml(e.target.value)}
                rows={10}
                className="font-mono text-xs"
                placeholder="Paste your full email HTML here. This overrides the base layout — you control everything."
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Use {"{{variables}}"} like {"{{name}}"}, {"{{appUrl}}"} — they get replaced at send time.
              </p>
            </div>
          )}

          {createMode === "clone" && (
            <p className="text-xs text-muted-foreground">
              All content (heading, body, CTA, after-CTA, custom HTML) will be copied from <strong>{cloneSource?.name}</strong>. Edit after creating.
            </p>
          )}

          {createError && <p className="text-xs text-error">{createError}</p>}

          <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? "Creating..." : "Create & Edit"}
          </Button>
        </div>
      )}

      {/* Templates table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Name</th>
              <th className="pb-2">Subject</th>
              <th className="pb-2 text-center">Type</th>
              <th className="pb-2 text-center">Enabled</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => {
              const isSystem = SYSTEM_TEMPLATES.includes(t.name);
              return (
                <tr key={t.id} className="border-b">
                  <td className="py-2 font-medium">{t.name}</td>
                  <td className="py-2 text-muted-foreground max-w-[200px] truncate">{t.subject}</td>
                  <td className="py-2 text-center">
                    {t.custom_html ? (
                      <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">HTML</span>
                    ) : (
                      <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Base</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    <button onClick={() => toggleEnabled(t)} className="text-sm">
                      {t.enabled ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-error mx-auto" />}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/emails/${t.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startClone(t)}>
                        <Copy className="h-3 w-3 mr-1" /> Clone
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => sendTest(t.name)} disabled={testSending === t.name}>
                        <Send className="h-3 w-3 mr-1" /> {testSending === t.name ? "..." : "Test"}
                      </Button>
                      {!isSystem && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-error hover:text-error" onClick={() => handleDelete(t)} disabled={deleting === t.id}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
