"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Monitor, Smartphone, Send, Bold, Italic, List, ListOrdered, Link2, Type, CheckCircle, Minus, Undo2, Copy, ChevronDown } from "lucide-react";
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

const AVAILABLE_VARS = [
  { key: "name", preview: "Siva", description: "User's first name" },
  { key: "appUrl", preview: "https://www.thecvedge.com", description: "App URL (from brand)" },
  { key: "supportEmail", preview: "hello@thecvedge.com", description: "Support email (from brand)" },
  { key: "score", preview: "78", description: "ATS score" },
  { key: "issueCount", preview: "5", description: "Number of ATS issues" },
  { key: "matchScore", preview: "72", description: "Job match score" },
  { key: "jobTitle", preview: "Senior Designer", description: "Job title" },
  { key: "company", preview: "Test Corp", description: "Company name" },
  { key: "daysAgo", preview: "5", description: "Days since signup" },
  { key: "cvId", preview: "test-id", description: "CV ID (for links)" },
];

const PREVIEW_VARS: Record<string, string> = Object.fromEntries(
  AVAILABLE_VARS.map((v) => [v.key, v.preview])
);

function replacePreviewVars(text: string, brand: Brand): string {
  let result = text;
  const allVars = { ...PREVIEW_VARS, appUrl: brand.app_url, supportEmail: brand.support_email, brandColor: brand.primary_color, logoText: brand.logo_text };
  for (const [key, value] of Object.entries(allVars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function renderPreviewHtml(t: Template, brand: Brand): string {
  // Custom HTML overrides everything
  if (t.custom_html) {
    return replacePreviewVars(t.custom_html, brand);
  }

  const subheading = replacePreviewVars(t.subheading, brand).replace(/\n/g, "<br>");
  const bodyHtml = replacePreviewVars(t.body_html || "", brand).replace(/\n/g, "<br>");
  const afterCtaHtml = replacePreviewVars(t.after_cta_html || "", brand).replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f5f0e8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; padding:24px 16px; }
  .header { padding:24px 32px; text-align:center; }
  .header img { max-width:140px; height:auto; }
  .card { background:#fff; border-radius:12px; padding:40px 32px; border:1px solid #ece5d8; }
  .card h1 { font-size:28px; font-weight:700; color:#1a1a1a; line-height:1.25; margin:0 0 12px; letter-spacing:-0.01em; }
  .card .sub { font-size:16px; color:#4a4a4a; line-height:1.6; margin:0 0 24px; }
  .card .body-html { margin:0 0 24px; font-size:16px; color:#4a4a4a; line-height:1.6; }
  .card .after-cta { font-size:16px; line-height:1.6; }
  .cta { display:inline-block; background:${brand.primary_color}; color:#fff; font-size:15px; font-weight:600; text-decoration:none; padding:12px 28px; border-radius:8px; }
  .after-cta { margin-top:16px; }
  .socials { text-align:center; padding:20px 0 4px; }
  .socials a { display:inline-block; margin:0 8px; color:#6B7280; text-decoration:none; font-size:13px; }
  .socials a:hover { color:#1a1a1a; }
  .footer { padding:12px 32px 8px; text-align:center; }
  .footer p { font-size:12px; color:#9CA3AF; margin:0; line-height:1.5; }
  .footer a { color:#9CA3AF; text-decoration:underline; }
  @media only screen and (max-width:480px) {
    .wrapper { padding:16px 12px; }
    .header { padding:16px 20px; }
    .card { padding:28px 20px; }
    .card h1 { font-size:22px; }
    .card .sub { font-size:14px; }
    .cta { padding:11px 24px; font-size:14px; }
    .footer { padding:12px 20px 8px; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="/img/cvedge-logo.png" alt="${brand.logo_text}" width="140" height="43">
  </div>
  <div class="card">
    <h1>${replacePreviewVars(t.heading, brand)}</h1>
    <p class="sub">${subheading}</p>
    ${bodyHtml ? `<div class="body-html">${bodyHtml}</div>` : ""}
    ${t.cta_text ? `<a href="${replacePreviewVars(t.cta_url || "#", brand)}" class="cta">${replacePreviewVars(t.cta_text, brand)}</a>` : ""}
    ${afterCtaHtml ? `<div class="after-cta">${afterCtaHtml}</div>` : ""}
  </div>
  <div class="socials">
    <a href="https://x.com/thecvedge"><img src="/img/email/icon-x.svg" width="24" height="24" alt="X" style="display:inline-block;vertical-align:middle;margin:0 6px;"></a>
    <a href="https://www.linkedin.com/company/cv-edge"><img src="/img/email/icon-linkedin.svg" width="24" height="24" alt="LinkedIn" style="display:inline-block;vertical-align:middle;margin:0 6px;"></a>
    <a href="https://www.instagram.com/thecvedge/"><img src="/img/email/icon-instagram.svg" width="24" height="24" alt="Instagram" style="display:inline-block;vertical-align:middle;margin:0 6px;"></a>
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} ${brand.logo_text} &middot; ${brand.support_email}</p>
    <p style="margin-top:4px"><a href="#">Unsubscribe</a></p>
  </div>
</div>
</body></html>`;
}

const COLOR_PRESETS = [
  { label: "Brand green", value: "#065F46" },
  { label: "Success", value: "#059669" },
  { label: "Emerald", value: "#34D399" },
  { label: "Warning", value: "#D97706" },
  { label: "Error", value: "#DC2626" },
  { label: "Navy", value: "#1E3A5F" },
  { label: "Dark", value: "#1a1a1a" },
  { label: "Body", value: "#4a4a4a" },
  { label: "Muted", value: "#9CA3AF" },
  { label: "White", value: "#ffffff" },
];

const FONT_SIZES = [
  { label: "12", value: "12px" },
  { label: "13", value: "13px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
];

function RichTextEditor({ value, onChange, label, rows = 6 }: { value: string; onChange: (v: string) => void; label: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showColors, setShowColors] = useState(false);
  const [colorTarget, setColorTarget] = useState<"text" | "bg">("text");
  const [showFontSize, setShowFontSize] = useState(false);

  /** Get selection boundaries, expanding outward to include a wrapping <span> if it fully encloses the selection */
  const getExpandedSelection = useCallback(() => {
    const el = ref.current;
    if (!el) return { start: 0, end: 0, selected: "" };
    let start = el.selectionStart;
    let end = el.selectionEnd;
    const selected = value.slice(start, end);

    // Check if selection is wrapped in a <span style="...">...</span>
    const beforeSel = value.slice(0, start);
    const afterSel = value.slice(end);
    const openMatch = beforeSel.match(/<span style="[^"]*">\s*$/);
    const closeMatch = afterSel.match(/^\s*<\/span>/);
    if (openMatch && closeMatch) {
      start -= openMatch[0].length;
      end += closeMatch[0].length;
    }

    return { start, end, selected };
  }, [value]);

  const wrapSelection = useCallback((before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newText = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    });
  }, [value, onChange]);

  const insertAt = useCallback((text: string) => {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionStart;
    const newText = value.slice(0, pos) + text + value.slice(pos);
    onChange(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos + text.length, pos + text.length);
    });
  }, [value, onChange]);

  const tools: Array<{ icon: React.ReactNode; title: string; action: () => void }> = [
    { icon: <Bold className="h-3.5 w-3.5" />, title: "Bold", action: () => wrapSelection("<strong>", "</strong>") },
    { icon: <Italic className="h-3.5 w-3.5" />, title: "Italic", action: () => wrapSelection("<em>", "</em>") },
    { icon: <Type className="h-3.5 w-3.5" />, title: "Heading", action: () => wrapSelection('<p style="font-size:20px;font-weight:700;color:#1a1a1a;margin:16px 0 8px;">', "</p>") },
    { icon: <Minus className="h-3.5 w-3.5" />, title: "Paragraph", action: () => wrapSelection('<p style="font-size:16px;color:#4a4a4a;line-height:1.6;margin:0 0 12px;">', "</p>") },
    { icon: <List className="h-3.5 w-3.5" />, title: "Bullet list", action: () => insertAt('<ul style="padding-left:20px;margin:8px 0;">\n  <li style="padding:2px 0;font-size:16px;color:#1a1a1a;">Item</li>\n</ul>') },
    { icon: <ListOrdered className="h-3.5 w-3.5" />, title: "Numbered list", action: () => insertAt('<ol style="padding-left:20px;margin:8px 0;">\n  <li style="padding:2px 0;font-size:16px;color:#1a1a1a;">Item</li>\n</ol>') },
    { icon: <CheckCircle className="h-3.5 w-3.5" />, title: "Check row", action: () => insertAt('<p style="padding:6px 0;color:#065F46;font-size:16px;">✓ Item</p>') },
    { icon: <Link2 className="h-3.5 w-3.5" />, title: "Link", action: () => wrapSelection('<a href="#" style="color:#065F46;text-decoration:underline;">', "</a>") },
    { icon: <Undo2 className="h-3.5 w-3.5" />, title: "Clear", action: () => onChange("") },
  ];

  function applyColor(color: string) {
    const { start, end } = getExpandedSelection();
    const el = ref.current;
    if (!el) return;

    const fullSelection = value.slice(start, end);

    // If the expanded selection is a <span style="color:...">text</span>, replace the color
    const colorSpanMatch = fullSelection.match(/^<span style="color:[^"]*;">([\s\S]*)<\/span>$/);
    const bgSpanMatch = fullSelection.match(/^<span style="background:[^"]*;[^"]*">([\s\S]*)<\/span>$/);

    let newText: string;
    if (colorTarget === "text" && colorSpanMatch) {
      // Replace existing text color
      newText = `<span style="color:${color};">${colorSpanMatch[1]}</span>`;
    } else if (colorTarget === "bg" && bgSpanMatch) {
      // Replace existing bg color
      newText = `<span style="background:${color};padding:2px 6px;border-radius:4px;">${bgSpanMatch[1]}</span>`;
    } else {
      // No existing span — wrap fresh using raw selection
      const rawStart = el.selectionStart;
      const rawEnd = el.selectionEnd;
      const selected = value.slice(rawStart, rawEnd);
      if (colorTarget === "text") {
        newText = value.slice(0, rawStart) + `<span style="color:${color};">${selected}</span>` + value.slice(rawEnd);
      } else {
        newText = value.slice(0, rawStart) + `<span style="background:${color};padding:2px 6px;border-radius:4px;">${selected}</span>` + value.slice(rawEnd);
      }
      onChange(newText);
      setShowColors(false);
      return;
    }

    onChange(value.slice(0, start) + newText + value.slice(end));
    setShowColors(false);
  }

  function applyFontSize(size: string) {
    const { start, end } = getExpandedSelection();
    const el = ref.current;
    if (!el) return;

    const fullSelection = value.slice(start, end);

    // If expanded selection is a <span style="font-size:...">text</span>, replace the size
    const sizeSpanMatch = fullSelection.match(/^<span style="font-size:[^"]*;">([\s\S]*)<\/span>$/);

    if (sizeSpanMatch) {
      const newText = `<span style="font-size:${size};">${sizeSpanMatch[1]}</span>`;
      onChange(value.slice(0, start) + newText + value.slice(end));
    } else {
      const rawStart = el.selectionStart;
      const rawEnd = el.selectionEnd;
      const selected = value.slice(rawStart, rawEnd);
      onChange(value.slice(0, rawStart) + `<span style="font-size:${size};">${selected}</span>` + value.slice(rawEnd));
    }
    setShowFontSize(false);
  }

  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 rounded-md border bg-background">
        <div className="relative flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
          {tools.map((t) => (
            <button
              key={t.title}
              type="button"
              title={t.title}
              onClick={t.action}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t.icon}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          <div className="relative">
            <button
              type="button"
              title="Text color"
              onClick={() => { setColorTarget("text"); setShowColors(!showColors); setShowFontSize(false); }}
              className={cn("rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", showColors && colorTarget === "text" && "bg-muted text-foreground")}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center text-[10px] font-bold">A</span>
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              title="Background color"
              onClick={() => { setColorTarget("bg"); setShowColors(!showColors); setShowFontSize(false); }}
              className={cn("rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", showColors && colorTarget === "bg" && "bg-muted text-foreground")}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-[#065F46] text-[8px] font-bold text-white">A</span>
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              title="Font size"
              onClick={() => { setShowFontSize(!showFontSize); setShowColors(false); }}
              className={cn("rounded px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", showFontSize && "bg-muted text-foreground")}
            >
              <span className="text-[10px] font-semibold">16</span>
            </button>
          </div>
          {showColors && (
            <div className="absolute left-0 right-0 top-full z-10 mt-0.5 flex flex-wrap gap-1.5 rounded-md border bg-background p-2 shadow-md">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => applyColor(c.value)}
                  className="group flex flex-col items-center gap-1"
                >
                  <span
                    className="h-6 w-6 rounded-full border border-border shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-[8px] text-muted-foreground">{c.label}</span>
                </button>
              ))}
              <div className="flex w-full items-center gap-1.5 border-t pt-1.5 mt-1">
                <input
                  type="color"
                  className="h-6 w-6 cursor-pointer rounded border-0 p-0"
                  onChange={(e) => applyColor(e.target.value)}
                  title="Custom color"
                />
                <span className="text-[9px] text-muted-foreground">Custom</span>
              </div>
            </div>
          )}
          {showFontSize && (
            <div className="absolute left-0 right-0 top-full z-10 mt-0.5 flex flex-wrap gap-1 rounded-md border bg-background p-2 shadow-md">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => applyFontSize(s.value)}
                  className="rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {s.label}px
                </button>
              ))}
            </div>
          )}
        </div>
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="border-0 rounded-none rounded-b-md font-mono text-xs focus-visible:ring-0 resize-y"
          placeholder="Type HTML or use the toolbar above..."
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">Toolbar inserts HTML. Preview updates live on the right.</p>
    </div>
  );
}

export function EmailEditor({ template: initial, brand }: { template: Template; brand: Brand }) {
  const router = useRouter();
  const [template, setTemplate] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showVars, setShowVars] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Save failed" }));
      alert(err.error || `Save failed (${res.status})`);
      return;
    }
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
          {/* Variables reference */}
          <button
            type="button"
            onClick={() => setShowVars(!showVars)}
            className="flex w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <span>Available variables</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showVars && "rotate-180")} />
          </button>
          {showVars && (
            <div className="rounded-md border bg-muted/30 p-2 space-y-1">
              {AVAILABLE_VARS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${v.key}}}`);
                    setCopiedVar(v.key);
                    setTimeout(() => setCopiedVar(null), 1500);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted transition-colors group"
                >
                  <code className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[11px] font-mono text-foreground border">
                    {`{{${v.key}}}`}
                  </code>
                  <span className="flex-1 truncate text-[11px] text-muted-foreground">{v.description}</span>
                  {copiedVar === v.key ? (
                    <span className="shrink-0 text-[10px] text-success">Copied</span>
                  ) : (
                    <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div>
            <Label className="text-xs">Subject</Label>
            <Input value={template.subject} onChange={(e) => setTemplate({ ...template, subject: e.target.value })} />
            <p className="text-[10px] text-muted-foreground mt-1">Supports {'{{variables}}'}</p>
          </div>

          {/* Mode toggle: Base layout vs Custom HTML */}
          <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
            <button
              onClick={() => setTemplate({ ...template, custom_html: null })}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${!template.custom_html ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
            >
              Base layout
            </button>
            <button
              onClick={() => setTemplate({ ...template, custom_html: template.custom_html || "" })}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${template.custom_html !== null ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
            >
              Custom HTML
            </button>
          </div>

          {template.custom_html !== null ? (
            /* Custom HTML mode */
            <div>
              <Label className="text-xs">Full HTML</Label>
              <Textarea
                value={template.custom_html}
                onChange={(e) => setTemplate({ ...template, custom_html: e.target.value })}
                rows={16}
                className="font-mono text-xs"
                placeholder="Paste full email HTML. This overrides the base layout completely."
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {"{{variables}}"} are replaced at send time. You control the entire HTML.
              </p>
            </div>
          ) : (
            /* Base layout mode */
            <>
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
              <RichTextEditor
                label="Body HTML (before CTA)"
                value={template.body_html ?? ""}
                onChange={(v) => setTemplate({ ...template, body_html: v })}
                rows={6}
              />
              <RichTextEditor
                label="After CTA HTML"
                value={template.after_cta_html ?? ""}
                onChange={(v) => setTemplate({ ...template, after_cta_html: v })}
                rows={4}
              />
            </>
          )}

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
        <div className="flex-1 overflow-auto p-4 lg:p-6 flex justify-center items-start">
          <div
            className="rounded-xl shadow-md overflow-hidden transition-all duration-200 mx-auto"
            style={{
              width: "100%",
              maxWidth: previewMode === "mobile" ? 375 : 600,
              minHeight: 400,
              border: previewMode === "mobile" ? "8px solid #1a1a1a" : undefined,
              borderRadius: previewMode === "mobile" ? 32 : 12,
            }}
          >
            <iframe
              srcDoc={renderPreviewHtml(template, brand)}
              className="w-full border-0"
              style={{ minHeight: 600, display: "block" }}
              title="Email preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
