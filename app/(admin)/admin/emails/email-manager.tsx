"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Send, Pencil, Check, X } from "lucide-react";

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
  const [templates, setTemplates] = useState(initial);
  const [brand, setBrand] = useState(initialBrand);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [testSending, setTestSending] = useState<string | null>(null);

  async function saveBrand() {
    setBrandSaving(true);
    await fetch("/api/admin/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    setBrandSaving(false);
  }

  async function saveTemplate() {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/admin/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setTemplates((prev) => prev.map((t) => (t.id === editing.id ? editing : t)));
    setSaving(false);
    setEditing(null);
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
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(t)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
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

      {/* Edit drawer */}
      <Sheet open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }}>
        <SheetContent>
          {editing && (
            <div className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>Edit: {editing.name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 mt-4">
                <div>
                  <Label className="text-xs">Subject</Label>
                  <Input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Heading</Label>
                  <Input value={editing.heading} onChange={(e) => setEditing({ ...editing, heading: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Subheading</Label>
                  <Textarea value={editing.subheading} onChange={(e) => setEditing({ ...editing, subheading: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label className="text-xs">CTA Text</Label>
                  <Input value={editing.cta_text ?? ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">CTA URL</Label>
                  <Input value={editing.cta_url ?? ""} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
                  <Label className="text-xs">Enabled</Label>
                </div>
              </div>
              <div className="border-t p-4">
                <Button className="w-full" onClick={saveTemplate} disabled={saving}>
                  {saving ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
