"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Monitor, Smartphone, Send } from "lucide-react";
import { cn } from "@/lib/utils";

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

function renderPreviewHtml(t: Template, brand: Brand): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:40px 32px;max-width:100%">
<tr><td>
  <p style="font-size:24px;font-weight:700;color:${brand.primary_color};margin:0 0 24px">${brand.logo_text}</p>
  <h1 style="font-size:32px;font-weight:700;color:#1a1a1a;line-height:1.2;margin:0 0 12px">${t.heading}</h1>
  <p style="font-size:16px;color:#666;line-height:1.5;margin:0 0 24px">${t.subheading}</p>
  ${t.body_html ? `<div style="margin:0 0 24px">${t.body_html}</div>` : ""}
  ${t.cta_text ? `<a href="${t.cta_url || "#"}" style="display:inline-block;background:${brand.primary_color};color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:100px">${t.cta_text}</a>` : ""}
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px">
  <p style="font-size:12px;color:#999;text-align:center;margin:0">&copy; ${new Date().getFullYear()} ${brand.logo_text} &middot; ${brand.support_email}</p>
  <p style="font-size:12px;color:#999;text-align:center;margin:4px 0 0"><a href="#" style="color:#999;text-decoration:underline">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export function EmailEditor({ template: initial, brand }: { template: Template; brand: Brand }) {
  const router = useRouter();
  const [template, setTemplate] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    setTesting(true);
    await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateName: template.name }),
    });
    setTesting(false);
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] -m-4 lg:-m-6">
      {/* Left: Form */}
      <div className="w-full lg:w-[380px] shrink-0 lg:border-r flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <button onClick={() => router.push("/admin/emails")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold flex-1 truncate">{template.name}</h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleTest} disabled={testing}>
              <Send className="h-3 w-3 mr-1" /> {testing ? "Sending..." : "Test"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <Label className="text-xs">Subject</Label>
            <Input value={template.subject} onChange={(e) => setTemplate({ ...template, subject: e.target.value })} />
            <p className="text-[10px] text-muted-foreground mt-1">Supports {'{{variables}}'}</p>
          </div>
          <div>
            <Label className="text-xs">Heading</Label>
            <Input value={template.heading} onChange={(e) => setTemplate({ ...template, heading: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Subheading</Label>
            <Textarea value={template.subheading} onChange={(e) => setTemplate({ ...template, subheading: e.target.value })} rows={3} />
          </div>
          <div>
            <Label className="text-xs">CTA Text</Label>
            <Input value={template.cta_text ?? ""} onChange={(e) => setTemplate({ ...template, cta_text: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">CTA URL</Label>
            <Input value={template.cta_url ?? ""} onChange={(e) => setTemplate({ ...template, cta_url: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Body HTML (optional)</Label>
            <Textarea value={template.body_html ?? ""} onChange={(e) => setTemplate({ ...template, body_html: e.target.value })} rows={4} className="font-mono text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="enabled" checked={template.enabled} onChange={(e) => setTemplate({ ...template, enabled: e.target.checked })} />
            <Label htmlFor="enabled" className="text-xs">Enabled</Label>
          </div>
        </div>

        <div className="border-t p-4">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saved ? "Saved" : saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-xs text-muted-foreground">Live Preview</span>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={cn(
                "rounded-md px-2 py-1 text-xs transition-colors",
                previewMode === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={cn(
                "rounded-md px-2 py-1 text-xs transition-colors",
                previewMode === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 lg:p-6 flex justify-center">
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200"
            style={{ width: previewMode === "mobile" ? 375 : 600, minHeight: 400 }}
          >
            <iframe
              srcDoc={renderPreviewHtml(template, brand)}
              className="w-full h-full border-0"
              style={{ minHeight: 500 }}
              title="Email preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
