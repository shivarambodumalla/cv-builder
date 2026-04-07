"use client";

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldRef } from "@/lib/ai/ats-analyser";
import { useUpgradeModal } from "@/context/upgrade-modal-context";

type RewriteMode = "ats" | "impact" | "concise" | "grammar";

interface RewriteIssue {
  description: string;
  fix: string;
  category: string;
  field_ref?: FieldRef;
}

interface DebateMessage {
  role: "user" | "ai";
  text: string;
}

interface AiRewriteDrawerProps {
  open: boolean;
  onClose: () => void;
  issue: RewriteIssue;
  originalText: string;
  targetRole: string;
  sectionType: string;
  sectionLabel: string;
  isCurrent: boolean;
  missingKeywords: string[];
  onAccept: (newText: string, fieldRef: FieldRef) => void;
}

const MODES: { key: RewriteMode; label: string }[] = [
  { key: "ats", label: "ATS" },
  { key: "impact", label: "Impact" },
  { key: "concise", label: "Concise" },
  { key: "grammar", label: "Grammar" },
];

function defaultMode(category: string): RewriteMode {
  if (category === "keywords") return "ats";
  if (category === "measurable_results") return "impact";
  if (category === "bullet_quality") return "concise";
  return "ats";
}

function charCountColor(len: number): string {
  if (len >= 120 && len <= 180) return "text-green-600";
  if (len > 0) return "text-amber-600";
  return "text-muted-foreground";
}

export function AiRewriteDrawer({
  open,
  onClose,
  issue,
  originalText,
  targetRole,
  sectionType,
  sectionLabel,
  isCurrent,
  missingKeywords,
  onAccept,
}: AiRewriteDrawerProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const [mode, setMode] = useState<RewriteMode>(defaultMode(issue.category));
  const [suggestedText, setSuggestedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [debateInput, setDebateInput] = useState("");
  const [debateLoading, setDebateLoading] = useState(false);
  const debateEndRef = useRef<HTMLDivElement>(null);

  async function fetchRewrite(rewriteMode: RewriteMode) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cv/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText,
          mode: rewriteMode,
          sectionType,
          targetRole,
          isCurrent,
          missingKeywords,
          issueDescription: issue.description,
          issueFix: issue.fix,
        }),
      });
      const data = await res.json();
      if (res.status === 403) {
        openUpgradeModal("ai_rewrite_limit");
        onClose();
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setSuggestedText(data.rewritten);
    } catch (err) {
      setError((err as Error).message || "Rewrite failed");
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-rewrite on open
  useEffect(() => {
    if (open && originalText) {
      const m = defaultMode(issue.category);
      setMode(m);
      setSuggestedText(null);
      setDebateMessages([]);
      setDebateInput("");
      setError(null);
      fetchRewrite(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleModeChange(newMode: RewriteMode) {
    setMode(newMode);
    fetchRewrite(newMode);
  }

  async function handleDebateSend() {
    const instruction = debateInput.trim();
    if (!instruction || !suggestedText) return;
    setDebateInput("");
    setDebateLoading(true);

    const newMessages: DebateMessage[] = [...debateMessages, { role: "user", text: instruction }];
    setDebateMessages(newMessages);

    try {
      const priorInstructions = debateMessages
        .filter((m) => m.role === "user")
        .map((m) => m.text);
      const fullInstruction = [...priorInstructions, instruction].join("\nThen: ");

      const res = await fetch("/api/cv/rewrite-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText,
          currentSuggestion: suggestedText,
          userInstruction: fullInstruction,
          mode,
          sectionType,
          targetRole,
          isCurrent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuggestedText(data.rewritten);
      setDebateMessages([...newMessages, { role: "ai", text: data.rewritten }]);
    } catch {
      setDebateMessages([...newMessages, { role: "ai", text: "Failed to refine. Try again." }]);
    } finally {
      setDebateLoading(false);
      setTimeout(() => debateEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  function handleAccept() {
    if (!suggestedText || !issue.field_ref) return;
    onAccept(suggestedText, issue.field_ref);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Rewrite
          </SheetTitle>
          <SheetDescription>{sectionLabel}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Issue context — only show when there's an actual issue (not inline form rewrite) */}
          {issue.description && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Issue</p>
              <p className="text-sm">{issue.description}</p>
              {issue.fix && (
                <p className="text-xs text-muted-foreground">{issue.fix}</p>
              )}
            </div>
          )}

          {/* Original text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Original</p>
              <span className="text-[11px] text-muted-foreground">{originalText.length} chars</span>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm text-muted-foreground">{originalText}</p>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex gap-1.5 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => handleModeChange(m.key)}
                className={cn(
                  "rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-medium transition-all",
                  mode === m.key
                    ? "bg-[#065F46] text-white border-transparent"
                    : "bg-transparent text-[#065F46] border-[#065F46] hover:bg-[#065F46]/5 dark:text-primary dark:border-primary"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Suggested text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Suggested</p>
              {suggestedText && (
                <span className={cn("text-[11px]", charCountColor(suggestedText.length))}>
                  {suggestedText.length} chars
                </span>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center rounded-lg border bg-muted/20 p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && !isLoading && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={() => fetchRewrite(mode)}>
                  <RotateCcw className="mr-1 h-3 w-3" /> Retry
                </Button>
              </div>
            )}

            {suggestedText && !isLoading && (
              <>
                <Textarea
                  value={suggestedText}
                  onChange={(e) => setSuggestedText(e.target.value)}
                  rows={4}
                  className="resize-y text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchRewrite(mode)}
                  className="text-xs"
                >
                  <RotateCcw className="mr-1 h-3 w-3" /> Regenerate
                </Button>
              </>
            )}
          </div>

          {/* Debate section */}
          {suggestedText && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Refine with instructions</p>

              {debateMessages.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border p-2">
                  {debateMessages.slice(-6).map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs max-w-[85%]",
                        msg.role === "user"
                          ? "ml-auto bg-primary/10 text-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={debateEndRef} />
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={debateInput}
                  onChange={(e) => setDebateInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleDebateSend(); } }}
                  placeholder="e.g. make it shorter..."
                  className="flex-1 text-sm"
                  disabled={debateLoading}
                />
                <Button
                  size="sm"
                  onClick={handleDebateSend}
                  disabled={!debateInput.trim() || debateLoading}
                >
                  {debateLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={!suggestedText || isLoading}
          >
            Accept & Insert
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
