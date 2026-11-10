"use client";

import { useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BulletChange {
  original: string | null;
  rewritten: string;
  changed: boolean;
  skipped: boolean;
  skip_reason: string | null;
}

interface ExperienceChange {
  company: string;
  title: string;
  bullets: BulletChange[];
  skipped: boolean;
  skip_reason: string | null;
}

export interface FixAllResult {
  summary: {
    original: string | null;
    rewritten: string;
    changed: boolean;
  };
  experience: ExperienceChange[];
  skills_to_add: string[];
  sections_needing_attention: { section: string; message: string }[];
  estimated_score_improvement: number;
}

type ChangeStatus = "accepted" | "rejected" | "editing";

interface TrackedChange {
  id: string;
  /** Eyebrow, e.g. "Monzo · bullet 2" */
  where: string;
  /** Short change-type pill, e.g. "Added metric" */
  tag: string;
  original: string | null;
  rewritten: string;
  editedText: string;
  status: ChangeStatus;
  fieldPath: string;
}

interface FixAllDrawerProps {
  open: boolean;
  onClose: () => void;
  result: FixAllResult;
  currentScore: number;
  onApply: (changes: { fieldPath: string; value: string }[]) => void;
  mode?: "fix-all" | "tailor";
  jdText?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PLACEHOLDER = /\[[^\]]+\]/;
const HAS_NUMBER = /\d/;

/** Best-effort label for what the AI changed. Purely descriptive, never gates anything. */
function changeTag(original: string | null, rewritten: string, isSummary: boolean): string {
  if (PLACEHOLDER.test(rewritten)) return "Fill in [X]";
  if (!original) return isSummary ? "New summary" : "New bullet";
  if (HAS_NUMBER.test(rewritten) && !HAS_NUMBER.test(original)) return "Added metric";
  if (rewritten.length < original.length * 0.8) return "Trimmed";
  const firstWord = (s: string) => s.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (firstWord(rewritten) !== firstWord(original)) return "Stronger verb";
  return "Reworded";
}

function buildTrackedChanges(result: FixAllResult): TrackedChange[] {
  const changes: TrackedChange[] = [];

  if (result.summary?.changed) {
    changes.push({
      id: "summary",
      where: "Summary",
      tag: changeTag(result.summary.original, result.summary.rewritten, true),
      original: result.summary.original,
      rewritten: result.summary.rewritten,
      editedText: result.summary.rewritten,
      status: "accepted",
      fieldPath: "summary.content",
    });
  }

  (result.experience ?? []).forEach((exp, expIdx) => {
    if (exp.skipped) return;
    const employer = exp.company || exp.title || `Role ${expIdx + 1}`;
    exp.bullets.forEach((bullet, bulletIdx) => {
      if (!bullet.changed || bullet.skipped) return;
      changes.push({
        id: `exp-${expIdx}-bullet-${bulletIdx}`,
        where: `${employer} · bullet ${bulletIdx + 1}`,
        tag: changeTag(bullet.original, bullet.rewritten, false),
        original: bullet.original,
        rewritten: bullet.rewritten,
        editedText: bullet.rewritten,
        status: "accepted",
        fieldPath: `experience.items.${expIdx}.bullets.${bulletIdx}`,
      });
    });
  });

  return changes;
}

function countBullets(result: FixAllResult): number {
  return (result.experience ?? []).reduce((n, exp) => n + (exp.bullets?.length ?? 0), 0);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FixAllDrawer({
  open,
  onClose,
  result,
  currentScore: _currentScore,
  onApply,
  mode = "fix-all",
  jdText: _jdText,
}: FixAllDrawerProps) {
  const [changes, setChanges] = useState<TrackedChange[]>(() =>
    buildTrackedChanges(result)
  );

  // Re-initialise when a new result arrives
  const [prevResult, setPrevResult] = useState(result);
  if (result !== prevResult) {
    setPrevResult(result);
    setChanges(buildTrackedChanges(result));
  }

  /* ---- actions --------------------------------------------------- */

  const updateChange = (id: string, patch: Partial<TrackedChange>) =>
    setChanges((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const accept = (id: string) => updateChange(id, { status: "accepted" });
  const reject = (id: string) => updateChange(id, { status: "rejected" });
  const startEdit = (id: string) => updateChange(id, { status: "editing" });

  const saveEdit = (id: string) =>
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted", rewritten: c.editedText } : c))
    );

  const cancelEdit = (id: string) =>
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted", editedText: c.rewritten } : c))
    );

  /* ---- derived --------------------------------------------------- */

  const skills = result.skills_to_add ?? [];
  const attention = result.sections_needing_attention ?? [];
  const totalChanges = changes.length;
  const acceptedCount = changes.filter((c) => c.status !== "rejected").length;
  const rejectedCount = totalChanges - acceptedCount;
  const allRejected = totalChanges > 0 && rejectedCount === totalChanges;
  const isEmpty = totalChanges === 0;

  const setAll = (status: ChangeStatus) =>
    setChanges((prev) =>
      prev.map((c) => ({ ...c, status, editedText: c.rewritten }))
    );

  /* ---- apply ----------------------------------------------------- */

  const handleApply = () => {
    const payload: { fieldPath: string; value: string }[] = [];
    changes.forEach((c) => {
      if (c.status === "accepted") payload.push({ fieldPath: c.fieldPath, value: c.rewritten });
      // An open edit is applied as typed rather than silently dropped.
      if (c.status === "editing") payload.push({ fieldPath: c.fieldPath, value: c.editedText });
    });
    skills.forEach((skill) => payload.push({ fieldPath: "skills.add", value: skill }));
    onApply(payload);
    onClose();
  };

  const applyLabel =
    acceptedCount > 0
      ? acceptedCount === totalChanges
        ? `Apply ${plural(acceptedCount, "change")}`
        : `Apply ${acceptedCount} accepted`
      : skills.length > 0
        ? `Add ${plural(skills.length, "skill")}`
        : "Apply";
  const canApply = acceptedCount > 0 || skills.length > 0;

  const bulletCount = countBullets(result);
  const checkedLine =
    bulletCount > 0
      ? `AI checked ${plural(bulletCount, "bullet")}${mode === "tailor" ? " against this job" : ""} and had nothing to improve.`
      : `AI checked your resume${mode === "tailor" ? " against this job" : ""} and had nothing to improve.`;

  /* ---- render ---------------------------------------------------- */

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col overflow-hidden bg-white p-0 sm:w-[40vw] sm:min-w-[440px] sm:max-w-[700px] [&>button:last-child]:hidden"
        data-testid="fix-all-drawer"
      >
        {/* ---- HEADER ---- */}
        <div className="flex items-start justify-between gap-3 border-b border-[#EFE9DF] px-5 py-[18px]">
          <div className="flex flex-col gap-[3px]">
            <SheetTitle className="text-[17px] font-bold leading-tight text-foreground">
              {isEmpty ? "Nothing to change" : `Review ${plural(totalChanges, "change")}`}
            </SheetTitle>
            <SheetDescription className="text-[13px] text-[#5F5954]">
              {isEmpty
                ? "AI made no edits to your resume."
                : `Nothing is applied until you confirm. ${acceptedCount} accepted, ${rejectedCount} kept as is.`}
            </SheetDescription>
          </div>
          <SheetClose
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E0D8CC] bg-white transition-colors hover:bg-[#F7F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </SheetClose>
        </div>

        {/* ---- CONTENT (scrollable) ---- */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="p-5">
              <section className="flex items-center gap-3.5 rounded-2xl border border-[#E0D8CC] bg-white p-[22px]">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/10"
                >
                  <Check className="h-[22px] w-[22px] text-[#065F46]" strokeWidth={2.5} />
                </span>
                <div className="flex flex-col gap-[3px]">
                  <h3 className="text-base font-bold text-foreground">
                    {mode === "tailor" ? "Your bullets already fit this job" : "Your bullets are already strong"}
                  </h3>
                  <p className="text-[13px] leading-[1.45] text-[#5F5954]">
                    {checkedLine}
                    {skills.length > 0 && ` It did find ${plural(skills.length, "skill")} worth adding.`}
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <ul>
              {changes.map((change) => {
                const isAccepted = change.status === "accepted";
                const isRejected = change.status === "rejected";
                const isEditing = change.status === "editing";
                return (
                  <li
                    key={change.id}
                    className={cn(
                      "flex flex-col gap-2.5 border-b border-[#EFE9DF] px-5 py-4 transition-opacity",
                      isRejected && "opacity-[0.55]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F5954]">
                        {change.where}
                      </span>
                      <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-[3px] text-[11px] font-bold text-secondary">
                        {change.tag}
                      </span>
                    </div>

                    {change.original && (
                      <p className="rounded-lg bg-error/10 px-3 py-2.5 text-[13px] leading-normal text-foreground/75 line-through decoration-error">
                        <span className="sr-only">Before: </span>
                        {change.original}
                      </p>
                    )}

                    {isEditing ? (
                      <Textarea
                        value={change.editedText}
                        onChange={(e) => updateChange(change.id, { editedText: e.target.value })}
                        aria-label={`Edit change for ${change.where}`}
                        className="min-h-[72px] border-success bg-success/10 text-[13px] leading-normal"
                        autoFocus
                      />
                    ) : (
                      <p className="rounded-lg bg-success/10 px-3 py-2.5 text-[13px] leading-normal text-foreground">
                        <span className="sr-only">After: </span>
                        {change.rewritten}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(change.id)}
                            className="flex h-11 items-center gap-1.5 rounded-[10px] border border-[#065F46] bg-[#065F46] px-3 text-[13px] font-semibold text-white transition hover:brightness-95 sm:h-[34px]"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelEdit(change.id)}
                            className="h-11 rounded-[10px] border border-[#E0D8CC] bg-white px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-[#F7F5F0] sm:h-[34px]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            aria-pressed={isAccepted}
                            onClick={() => accept(change.id)}
                            className={cn(
                              "h-11 rounded-[10px] border px-3 text-[13px] font-semibold transition sm:h-[34px]",
                              isAccepted
                                ? "border-[#065F46] bg-[#065F46] text-white"
                                : "border-[#E0D8CC] bg-white text-[#065F46] hover:bg-[#F7F5F0]"
                            )}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            aria-pressed={isRejected}
                            onClick={() => reject(change.id)}
                            className={cn(
                              "h-11 rounded-[10px] border px-3 text-[13px] font-semibold transition sm:h-[34px]",
                              isRejected
                                ? "border-[#5F5954] bg-[#5F5954] text-white"
                                : "border-[#E0D8CC] bg-white text-foreground hover:bg-[#F7F5F0]"
                            )}
                          >
                            Keep mine
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(change.id)}
                            className="ml-auto flex h-11 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-[#5F5954] transition-colors hover:bg-[#F7F5F0] sm:h-[34px]"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {(skills.length > 0 || attention.length > 0) && (
            <div className="flex flex-col gap-3 px-5 py-4">
              {skills.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F5954]">
                    Skills added when you apply
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {attention.map((s) => (
                <div
                  key={s.section}
                  className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-[13px] leading-normal text-foreground"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                  <span>{s.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- FOOTER ---- */}
        <div className="flex items-center justify-between gap-3 border-t border-[#EFE9DF] bg-[#FBFAF7] px-5 py-3.5">
          {isEmpty ? (
            <>
              <SheetClose className="h-11 rounded-xl border border-[#E0D8CC] bg-white px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[#F7F5F0]">
                Close
              </SheetClose>
              {skills.length > 0 && (
                <button
                  type="button"
                  onClick={handleApply}
                  data-testid="btn-apply-selected"
                  className="h-11 rounded-xl bg-[#065F46] px-[18px] text-sm font-semibold text-white transition hover:brightness-95"
                >
                  {applyLabel}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAll(allRejected ? "accepted" : "rejected")}
                data-testid="btn-reject-all"
                className="h-11 rounded-xl border border-[#E0D8CC] bg-white px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[#F7F5F0]"
              >
                {allRejected ? "Accept all" : "Reject all"}
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!canApply}
                data-testid="btn-apply-selected"
                className="h-11 rounded-xl bg-[#065F46] px-[18px] text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {applyLabel}
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
