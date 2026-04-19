"use client";

import { useState } from "react";
import { useSignupModal, type SignupTrigger } from "@/components/popups/signup-modal";
import { AppPopover } from "@/components/popups/app-popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Eye, X, Download, Briefcase, Upload, ArrowRight, BarChart3, Sparkles, BookOpen, FileText } from "lucide-react";

interface PopupConfig {
  id: string;
  name: string;
  category: "signup_modal" | "popover" | "inline";
  trigger: SignupTrigger | "nudge";
  pages: string[];
  who: string;
  condition: string;
  frequency: string;
  previewTitle?: string;
  previewSubtitle?: string;
  previewCta?: string;
  previewIcon?: string;
  signupContext?: { trigger: SignupTrigger; templateName?: string; templateImg?: string; roleName?: string; searchQuery?: string };
}

const POPUPS: PopupConfig[] = [
  // Signup modals
  { id: "timed", name: "Timed Modal", category: "signup_modal", trigger: "timed", pages: ["/", "/resumes", "/jobs", "/pricing"], who: "Anonymous", condition: "2.5min + 40% scroll + idle 15s", frequency: "7 days", signupContext: { trigger: "timed" } },
  { id: "template_click", name: "Template Click", category: "signup_modal", trigger: "template_click", pages: ["/resumes"], who: "Anonymous", condition: "Clicks template card", frequency: "Session", signupContext: { trigger: "template_click", templateName: "Classic", templateImg: "/img/templates/classic.jpg" } },
  { id: "job_search", name: "Job Search", category: "signup_modal", trigger: "job_search", pages: ["/jobs"], who: "Anonymous", condition: "Submits search", frequency: "Session", signupContext: { trigger: "job_search", searchQuery: "Software Engineer" } },
  { id: "role_page", name: "Role Page", category: "signup_modal", trigger: "role_page", pages: ["/jobs/[role]"], who: "Anonymous", condition: "Clicks sign-in CTA", frequency: "Session", signupContext: { trigger: "role_page", roleName: "Software Engineer" } },
  { id: "resumes_cta", name: "Resumes CTA", category: "signup_modal", trigger: "resumes_cta", pages: ["/resumes"], who: "Anonymous", condition: "'Get started free' click", frequency: "Session", signupContext: { trigger: "resumes_cta" } },
  { id: "jobs_cta", name: "Jobs CTA", category: "signup_modal", trigger: "jobs_cta", pages: ["/jobs"], who: "Anonymous", condition: "Sign-in CTA click", frequency: "Session", signupContext: { trigger: "jobs_cta" } },
  { id: "exit_intent", name: "Exit Intent", category: "signup_modal", trigger: "exit_intent", pages: ["/", "/resumes", "/jobs", "/pricing"], who: "Anonymous (desktop)", condition: "Mouse leaves top", frequency: "Session", signupContext: { trigger: "exit_intent" } },
  // Popovers (bottom-right, non-blocking)
  { id: "download_nudge", name: "Download Nudge", category: "popover", trigger: "nudge", pages: ["/resume/[id]"], who: "Authenticated", condition: "ATS score + 0 downloads", frequency: "3 days", previewTitle: "You scored 84 but haven't downloaded", previewSubtitle: "Take your improved CV with you.", previewCta: "Download my CV", previewIcon: "download" },
  { id: "jobs_discovery", name: "Jobs Discovery", category: "popover", trigger: "nudge", pages: ["/dashboard", "/resume/[id]"], who: "Authenticated", condition: "Has CV + never visited /my-jobs", frequency: "7 days", previewTitle: "Your CV can match live jobs", previewSubtitle: "See which roles you're most likely to land.", previewCta: "See matching jobs", previewIcon: "briefcase" },
  { id: "upload_cv", name: "Upload CV", category: "popover", trigger: "nudge", pages: ["/dashboard"], who: "Authenticated", condition: "0 CVs + 60s delay", frequency: "7 days", previewTitle: "Upload your CV — takes 30 seconds", previewSubtitle: "Get your ATS score and start improving.", previewCta: "Upload now", previewIcon: "upload" },
  { id: "return_visit", name: "Return Visit", category: "popover", trigger: "nudge", pages: ["/dashboard"], who: "Authenticated", condition: "3+ days since last sign-in", frequency: "1 day", previewTitle: "Welcome back! Your ATS score was 72.", previewSubtitle: "Pick up where you left off.", previewCta: "Continue where you left off", previewIcon: "arrow-right" },
  // Inline (contextual, stays in page)
  { id: "ats_scan_dot", name: "ATS Scan Dot", category: "inline", trigger: "nudge", pages: ["/resume/[id]"], who: "Authenticated", condition: "No ATS report on CV", frequency: "Always", previewTitle: "Pulsing green dot on ATS tab", previewSubtitle: "Tooltip: Run your free ATS scan", previewCta: "(visual indicator)" },
  { id: "job_match", name: "Job Match Nudge", category: "inline", trigger: "nudge", pages: ["/resume/[id]"], who: "Authenticated", condition: "ATS done + no matches", frequency: "Always", previewTitle: "Now see how you match real jobs", previewSubtitle: "Switches to Match tab.", previewCta: "Run job match" },
  { id: "story_nudge", name: "Story Extraction", category: "inline", trigger: "nudge", pages: ["/interview-coach"], who: "Authenticated", condition: "Has CV + 0 stories", frequency: "Always", previewTitle: "Your CV has achievements worth turning into stories", previewSubtitle: "AI extracts STAR stories from your experience.", previewCta: "Extract stories" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  download: Download, briefcase: Briefcase, upload: Upload, "arrow-right": ArrowRight, scan: BarChart3, sparkles: Sparkles, book: BookOpen,
};

const CATEGORY_LABELS = { signup_modal: "Signup Modals", popover: "Bottom-Right Popovers", inline: "Inline Nudges" };
const CATEGORY_COLORS = { signup_modal: "bg-[#065F46] text-white", popover: "bg-primary/10 text-primary", inline: "bg-muted text-muted-foreground" };
const CATEGORY_DESCS = {
  signup_modal: "Full-screen modals for anonymous visitors — drive signups",
  popover: "Non-blocking bottom-right cards for authenticated users — green header + beige body",
  inline: "Contextual indicators embedded in the page — subtle engagement nudges",
};

export function PopupAudit() {
  const { showSignupModal } = useSignupModal();
  const [previewPopover, setPreviewPopover] = useState<PopupConfig | null>(null);

  function handlePreview(p: PopupConfig) {
    if (p.category === "signup_modal" && p.signupContext) {
      const key = "cvedge_signup_modal_dismissed";
      const saved = localStorage.getItem(key);
      localStorage.removeItem(key);
      showSignupModal(p.signupContext);
      if (saved) setTimeout(() => localStorage.setItem(key, saved), 100);
    } else {
      setPreviewPopover(p);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["signup_modal", "popover", "inline"] as const).map((cat) => (
          <div key={cat} className="rounded-xl border p-4">
            <p className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[cat]}</p>
            <p className="text-2xl font-bold mt-1">{POPUPS.filter(p => p.category === cat).length}</p>
            <span className={cn("inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold", CATEGORY_COLORS[cat])}>
              All active
            </span>
          </div>
        ))}
      </div>

      {/* Sections by category */}
      {(["signup_modal", "popover", "inline"] as const).map((cat) => {
        const items = POPUPS.filter(p => p.category === cat);
        return (
          <div key={cat} className="rounded-xl border overflow-hidden">
            <div className="border-b px-4 py-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", cat === "signup_modal" ? "bg-[#065F46]" : cat === "popover" ? "bg-primary" : "bg-muted-foreground")} />
                <h2 className="text-sm font-semibold">{CATEGORY_LABELS[cat]} ({items.length})</h2>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{CATEGORY_DESCS[cat]}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/10 text-xs">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Pages</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Trigger</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Cooldown</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Preview</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-xs">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{p.who}</span>
                    </td>
                    <td className="px-4 py-2.5"><div className="flex flex-wrap gap-1">{p.pages.map(pg => <span key={pg} className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono">{pg}</span>)}</div></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[180px]">{p.condition}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.frequency}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handlePreview(p)}>
                        <Eye className="h-3 w-3" /> Preview
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Checklist */}
      <div className="rounded-xl border p-5">
        <h3 className="text-sm font-semibold mb-3">All {POPUPS.length} triggers active</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POPUPS.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-success shrink-0" />
              <span className="text-xs">{p.name} — {p.condition}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popover / inline preview modal */}
      {previewPopover && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end bg-black/30 p-6" onClick={() => setPreviewPopover(null)}>
          {/* Preview as actual popover in bottom-right */}
          <div className="w-[340px] animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl shadow-2xl overflow-hidden border">
              {/* Green header */}
              <div className="bg-[#065F46] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = ICON_MAP[previewPopover.previewIcon || ""] || FileText;
                    return (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    );
                  })()}
                  <span className="text-white text-xs font-bold">CV<span className="text-[#34D399]">Edge</span></span>
                </div>
                <button onClick={() => setPreviewPopover(null)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-white/70 hover:bg-black/30 hover:text-white transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Beige body */}
              <div className="bg-[#F5F0E8] dark:bg-card px-4 py-4">
                <h3 className="text-sm font-semibold mb-1">{previewPopover.previewTitle}</h3>
                <p className="text-xs text-muted-foreground mb-4">{previewPopover.previewSubtitle}</p>
                <button className="w-full rounded-lg bg-[#065F46] py-2 text-xs font-semibold text-white">
                  {previewPopover.previewCta}
                </button>
                <button onClick={() => setPreviewPopover(null)} className="block w-full text-center text-[11px] text-muted-foreground mt-2">
                  Maybe later
                </button>
              </div>
            </div>
            {/* Metadata */}
            <div className="mt-2 rounded-lg bg-background border p-3 text-[10px] text-muted-foreground space-y-1">
              <p><strong>Category:</strong> {CATEGORY_LABELS[previewPopover.category]}</p>
              <p><strong>Pages:</strong> {previewPopover.pages.join(", ")}</p>
              <p><strong>Who:</strong> {previewPopover.who}</p>
              <p><strong>Condition:</strong> {previewPopover.condition}</p>
              <p><strong>Cooldown:</strong> {previewPopover.frequency}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
