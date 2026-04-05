"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Pencil, Check, X, Plus } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  heading: string;
  subheading: string;
  cta_text: string | null;
  cta_url: string | null;
  body_html: string | null;
  enabled: boolean;
}

interface Brand {
  id: string;
  primary_color: string;
  logo_text: string;
  support_email: string;
  app_url: string;
}

export function EmailManager({ templates: initial, brand: initialBrand }: { templates: Template[]; brand: Brand }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initial);
  const [brand, setBrand] = useState(initialBrand);
  const [brandSaving, setBrandSaving] = useState(false);
  const [testSending, setTestSending] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newHtml, setNewHtml] = useState("");
  const [creating, setCreating] = useState(false);

  async function saveBrand() {
    setBrandSaving(true);
    await fetch("/api/admin/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    setBrandSaving(false);
  }

  async function toggleEnabled(t: Template) {
    const updated = { ...t, enabled: !t.enabled };
    await fetch("/api/admin/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setTemplates((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        name: newName.trim().toLowerCase().replace(/\s+/g, "_"),
        subject: newSubject || newName,
        heading: newName,
        subheading: "",
        body_html: newHtml || null,
      }),
    });
    const data = await res.json();
    if (data.id) {
      setNewName("");
      setNewSubject("");
      setNewHtml("");
      setShowCreate(false);
      router.push(`/admin/emails/${data.id}`);
    }
    setCreating(false);
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
        <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Template
        </Button>
      ) : (
        <div className="rounded-lg border p-4 space-y-4">
          <h2 className="text-sm font-semibold">Create Custom Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Template Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. April Launch Announcement" />
            </div>
            <div>
              <Label className="text-xs">Subject Line</Label>
              <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Big news from CVEdge" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Raw HTML (paste your email HTML here, or leave blank to use the visual editor after creating)</Label>
            <Textarea value={newHtml} onChange={(e) => setNewHtml(e.target.value)} rows={8} className="font-mono text-xs" placeholder="<h2>Your custom email content...</h2>" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? "Creating..." : "Create & Edit"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setNewName(""); setNewSubject(""); setNewHtml(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Templates table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2">Name</th>
              <th className="pb-2">Subject</th>
              <th className="pb-2 text-center">Enabled</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2 font-medium">{t.name}</td>
                <td className="py-2 text-muted-foreground max-w-[200px] truncate">{t.subject}</td>
                <td className="py-2 text-center">
                  <button onClick={() => toggleEnabled(t)} className="text-sm">
                    {t.enabled ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                  </button>
                </td>
                <td className="py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/emails/${t.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => sendTest(t.name)} disabled={testSending === t.name}>
                      <Send className="h-3 w-3 mr-1" /> {testSending === t.name ? "Sending..." : "Test"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}
