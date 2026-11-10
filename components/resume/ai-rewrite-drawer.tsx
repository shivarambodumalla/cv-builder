"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw, Send, X } from "lucide-react";
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

const REWRITE_ERROR = "Couldn't rewrite this. Check your connection and try again.";
const REFINE_ERROR = "Couldn't refine the suggestion. Your instruction is back in the box, try again.";

function defaultMode(category: string): RewriteMode {
  if (category === "keywords") return "ats";
  if (category === "measurable_results") return "impact";
  if (category === "bullet_quality") return "concise";
  return "ats";
}

function charCountColor(len: number): string {
  if (len >= 120 && len <= 180) return "text-success";
  if (len > 0) return "text-warning";
  return "text-muted-foreground";
}

function drawerTitle(sectionType: string): string {
  if (sectionType === "summary") return "Rewrite summary";
  if (sectionType === "experience") return "Rewrite bullet";
  return "Rewrite text";
}

/** Reads a JSON body without throwing on an HTML error page. */
async function readJson(res: Response): Promise<{ rewritten?: string; error?: string }> {
  return res.json().catch(() => ({}));
}

const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.08em]";

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
  const [debateError, setDebateError] = useState<string | null>(null);
  const debateEndRef = useRef<HTMLDivElement>(null);
  const modeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Switching modes quickly fires overlapping requests; only the latest may land.
  const requestId = useRef(0);

  async function fetchRewrite(rewriteMode: RewriteMode) {
    const id = ++requestId.current;
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
      const data = await readJson(res);
      if (id !== requestId.current) return;
      if (res.status === 403) {
        openUpgradeModal("rewrite_limit");
        onClose();
        return;
      }
      if (!res.ok || !data.rewritten) throw new Error(data.error || REWRITE_ERROR);
      setSuggestedText(data.rewritten);
    } catch (err) {
      if (id !== requestId.current) return;
      setError((err as Error).message || REWRITE_ERROR);
    } finally {
      if (id === requestId.current) setIsLoading(false);
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
      setDebateError(null);
      setError(null);
      fetchRewrite(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleModeChange(newMode: RewriteMode) {
    if (newMode === mode && (isLoading || suggestedText)) return;
    setMode(newMode);
    fetchRewrite(newMode);
  }

  // Radiogroup keyboard pattern: arrows move and select.
  function handleModeKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + MODES.length) % MODES.length;
    modeRefs.current[next]?.focus();
    handleModeChange(MODES[next].key);
  }

  async function handleDebateSend() {
    const instruction = debateInput.trim();
    if (!instruction || !suggestedText) return;
    setDebateInput("");
    setDebateError(null);
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
      const data = await readJson(res);
      // rewrite-debate is gated under ai_rewrite, same as /api/cv/rewrite
      if (res.status === 403) {
        setDebateMessages(debateMessages);
        openUpgradeModal("rewrite_limit");
        onClose();
        return;
      }
      if (!res.ok || !data.rewritten) throw new Error(data.error);
      setSuggestedText(data.rewritten);
      setDebateMessages([...newMessages, { role: "ai", text: data.rewritten }]);
    } catch {
      // Drop the unanswered instruction and hand it back so a retry is one click.
      setDebateMessages(debateMessages);
      setDebateInput(instruction);
      setDebateError(REFINE_ERROR);
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

  const modeLabel = MODES.find((m) => m.key === mode)?.label ?? "";
  const busy = isLoading || debateLoading;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="flex flex-col overflow-hidden bg-white p-0 [&>button:last-child]:hidden">
        {/* ---- HEADER ---- */}
        <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-5">
          <SheetTitle className="text-[17px] font-bold leading-tight text-foreground">
            {drawerTitle(sectionType)}
          </SheetTitle>
          <SheetClose
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E0D8CC] bg-white transition-colors hover:bg-[#F7F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">
          Pick a rewrite style, review the suggestion, then use it or keep your original.
        </SheetDescription>

        {/* ---- BODY ---- */}
        <div className="flex-1 space-y-3.5 overflow-y-auto px-5 pb-5 pt-3">
          {/* Issue context: only for ATS / Job Match rewrites, not inline form rewrites */}
          {issue.description && (
            <div className="space-y-1 rounded-lg border border-[#E0D8CC] p-3">
              <p className={cn(EYEBROW, "text-[#5F5954]")}>Issue</p>
              <p className="text-[13px] leading-normal text-foreground">{issue.description}</p>
              {issue.fix && <p className="text-xs leading-normal text-[#5F5954]">{issue.fix}</p>}
            </div>
          )}

          {/* Original */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className={cn(EYEBROW, "text-[#5F5954]")}>
                Original{sectionLabel ? ` · ${sectionLabel}` : ""}
              </p>
              <span className="shrink-0 text-[11px] text-[#5F5954]">{originalText.length} chars</span>
            </div>
            <p className="rounded-lg border border-[#EFE9DF] bg-[#FBFAF7] px-3 py-2.5 text-[13px] leading-normal text-[#5F5954]">
              {originalText}
            </p>
          </div>

          {/* Mode selector */}
          <div role="radiogroup" aria-label="Rewrite mode" className="flex flex-wrap gap-1.5">
            {MODES.map((m, i) => {
              const on = mode === m.key;
              return (
                <button
                  key={m.key}
                  ref={(el) => { modeRefs.current[i] = el; }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => handleModeChange(m.key)}
                  onKeyDown={(e) => handleModeKeyDown(e, i)}
                  className={cn(
                    "h-11 rounded-full border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-[34px]",
                    on
                      ? "border-[#065F46] bg-[#065F46] text-white"
                      : "border-[#E0D8CC] bg-white text-foreground hover:bg-[#F7F5F0]"
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Suggestion */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="ai-rewrite-suggestion" className={cn(EYEBROW, "text-[#065F46]")}>
                Suggestion · {modeLabel}
              </label>
              {suggestedText && !isLoading && (
                <span className={cn("shrink-0 text-[11px]", charCountColor(suggestedText.length))}>
                  {suggestedText.length} chars
                </span>
              )}
            </div>

            {isLoading && (
              <div
                role="status"
                className="flex items-center justify-center gap-2 rounded-lg bg-success/10 p-8 text-[13px] text-[#5F5954]"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Writing the {modeLabel} version…
              </div>
            )}

            {error && !isLoading && (
              <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-error bg-error/10 px-3.5 py-3 text-[13px] text-foreground">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => fetchRewrite(mode)}
                  className="flex h-11 shrink-0 items-center gap-1 rounded-lg border border-error bg-white px-2.5 text-xs font-semibold text-error transition-colors hover:bg-error/10 sm:h-8"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" /> Retry
                </button>
              </div>
            )}

            {suggestedText && !isLoading && (
              <Textarea
                id="ai-rewrite-suggestion"
                value={suggestedText}
                onChange={(e) => setSuggestedText(e.target.value)}
                rows={4}
                className="resize-y border-transparent bg-success/10 px-3 py-3 text-sm leading-normal text-foreground focus-visible:border-success"
              />
            )}
          </div>

          {/* Refine with instructions (debate) */}
          {suggestedText && !isLoading && (
            <div className="space-y-2">
              <p className={cn(EYEBROW, "text-[#5F5954]")}>Refine with instructions</p>

              {debateMessages.length > 0 && (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-[#EFE9DF] p-2">
                  {debateMessages.slice(-6).map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] rounded-md px-3 py-1.5 text-xs",
                        msg.role === "user"
                          ? "ml-auto bg-secondary/10 text-foreground"
                          : "bg-[#FBFAF7] text-[#5F5954]"
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={debateEndRef} />
                </div>
              )}

              {debateError && (
                <p role="alert" className="text-xs text-error">{debateError}</p>
              )}

              <div className="flex gap-2">
                <Input
                  value={debateInput}
                  onChange={(e) => setDebateInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleDebateSend(); } }}
                  placeholder="e.g. make it shorter..."
                  aria-label="Refine instruction"
                  className="h-11 flex-1 border-[#E0D8CC] text-sm sm:h-10"
                  disabled={debateLoading}
                />
                <button
                  type="button"
                  onClick={handleDebateSend}
                  disabled={!debateInput.trim() || debateLoading}
                  aria-label="Send instruction"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#065F46] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                >
                  {debateLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---- FOOTER ---- */}
        <div className="flex justify-end gap-2 border-t border-[#EFE9DF] bg-[#FBFAF7] px-5 py-3.5">
          <button
            type="button"
            onClick={() => fetchRewrite(mode)}
            disabled={busy}
            className="flex h-11 items-center gap-1.5 rounded-[10px] border border-[#E0D8CC] bg-white px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-[#F7F5F0] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Regenerate
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!suggestedText || busy || !issue.field_ref}
            className="h-11 rounded-[10px] bg-[#065F46] px-4 text-[13px] font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10"
          >
            Use this
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
