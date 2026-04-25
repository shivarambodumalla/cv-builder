"use client";

import { useEffect, useState } from "react";
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

interface CodeTemplate {
  name: string;
  description: string;
}

interface JobsCopy {
  subject?: string;
  heroHeading?: string;
  heroSub?: string;
  footerNote?: string;
}

interface JobsCopyResponse {
  override: JobsCopy;
  defaults: Required<JobsCopy>;
}

const JOBS_COPY_FIELDS: Array<{ key: keyof JobsCopy; label: string; placeholder: string; multiline?: boolean }> = [
  { key: "subject", label: "Subject line", placeholder: "{{jobCount}} new matches for {{targetTitle}}" },
  { key: "heroHeading", label: "Hero heading", placeholder: "{{jobCount}} new matches for you this week" },
  { key: "heroSub", label: "Hero sub-heading", placeholder: "Roles like {{targetTitle}}", multiline: true },
  { key: "footerNote", label: "Footer note", placeholder: "You're getting this digest because…", multiline: true },
];

export function EmailManager({
  templates: initial,
  codeTemplates = [],
  brand: initialBrand,
}: {
  templates: Template[];
  codeTemplates?: CodeTemplate[];
  brand: Brand;
}) {
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

  // Jobs copy editor state
  const [editingCopy, setEditingCopy] = useState<string | null>(null);
  const [copyData, setCopyData] = useState<Record<string, JobsCopyResponse>>({});
  const [copyDraft, setCopyDraft] = useState<JobsCopy>({});
  const [copySaving, setCopySaving] = useState(false);

  useEffect(() => {
    if (codeTemplates.length === 0) return;
    fetch("/api/admin/jobs-email-copy")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setCopyData(d); })
      .catch(() => {});
  }, [codeTemplates.length]);

  function startEditCopy(name: string) {
    setEditingCopy(name);
    setCopyDraft(copyData[name]?.override ?? {});
  }

  async function saveCopy() {
    if (!editingCopy) return;
    setCopySaving(true);
    const res = await fetch("/api/admin/jobs-email-copy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateName: editingCopy, copy: copyDraft }),
    });
    setCopySaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || `Save failed (${res.status})`);
      return;
    }
    setCopyData((prev) => ({
      ...prev,
      [editingCopy]: { ...(prev[editingCopy] ?? { defaults: {} as Required<JobsCopy> }), override: copyDraft },
    }));
    setEditingCopy(null);
  }

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
        <h2 className="text-sm font-semibold mb-2">Editable Templates</h2>
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

      {codeTemplates.length > 0 && (
        <div className="overflow-x-auto">
          <div className="mb-2">
            <h2 className="text-sm font-semibold">Code-rendered Templates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Layout lives in React components. The voice — subject, hero, footer — is editable here.
              Job cards, tips, and ATS hints stay code-driven.
            </p>
          </div>

          {editingCopy && (
            <div className="mb-4 rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Edit copy: {editingCopy}</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingCopy(null)}>Cancel</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Variables: <code className="rounded bg-muted px-1">{"{{firstName}}"}</code>{" "}
                <code className="rounded bg-muted px-1">{"{{jobCount}}"}</code>{" "}
                <code className="rounded bg-muted px-1">{"{{targetTitle}}"}</code>{" "}
                <code className="rounded bg-muted px-1">{"{{location}}"}</code>{" "}
                <code className="rounded bg-muted px-1">{"{{atsScore}}"}</code>{" "}
                <code className="rounded bg-muted px-1">{"{{logoText}}"}</code>. Leave a field blank to use the default.
              </p>
              {JOBS_COPY_FIELDS.map((field) => {
                const fallback = copyData[editingCopy]?.defaults?.[field.key] ?? "";
                const value = copyDraft[field.key] ?? "";
                return (
                  <div key={field.key}>
                    <Label className="text-xs">{field.label}</Label>
                    {field.multiline ? (
                      <Textarea
                        value={value}
                        onChange={(e) => setCopyDraft({ ...copyDraft, [field.key]: e.target.value })}
                        rows={2}
                        className="text-sm"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => setCopyDraft({ ...copyDraft, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                      />
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Default: {fallback}</p>
                  </div>
                );
              })}
              <Button size="sm" onClick={saveCopy} disabled={copySaving}>
                {copySaving ? "Saving…" : "Save copy"}
              </Button>
            </div>
          )}
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Name</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Type</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codeTemplates.map((t) => {
                const hasOverride = Object.values(copyData[t.name]?.override ?? {}).some((v) => !!v);
                return (
                  <tr key={t.name} className="border-b">
                    <td className="py-2 font-medium">
                      {t.name}
                      {hasOverride && <span className="ml-2 text-[10px] text-success">edited</span>}
                    </td>
                    <td className="py-2 text-muted-foreground max-w-[360px]">{t.description}</td>
                    <td className="py-2 text-center">
                      <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Code</span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startEditCopy(t.name)}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit copy
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => sendTest(t.name)} disabled={testSending === t.name}>
                          <Send className="h-3 w-3 mr-1" /> {testSending === t.name ? "..." : "Test"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
