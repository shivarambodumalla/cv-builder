"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, Pencil } from "lucide-react";

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

type ChangeStatus = "pending" | "accepted" | "rejected" | "editing";

interface TrackedChange {
  id: string;
  section: string;
  label: string;
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

function buildTrackedChanges(result: FixAllResult): TrackedChange[] {
  const changes: TrackedChange[] = [];

  // Summary
  if (result.summary.changed) {
    changes.push({
      id: "summary",
      section: "summary",
      label: result.summary.original ? "Summary" : "New summary generated",
      original: result.summary.original,
      rewritten: result.summary.rewritten,
      editedText: result.summary.rewritten,
      status: "accepted",
      fieldPath: "summary.content",
    });
  }

  // Experience bullets
  result.experience.forEach((exp, expIdx) => {
    if (exp.skipped) return;
    exp.bullets.forEach((bullet, bulletIdx) => {
      if (!bullet.changed || bullet.skipped) return;
      changes.push({
        id: `exp-${expIdx}-bullet-${bulletIdx}`,
        section: "experience",
        label: `${exp.title} at ${exp.company}`,
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FixAllDrawer({
  open,
  onClose,
  result,
  currentScore,
  onApply,
  mode = "fix-all",
  jdText,
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
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );

  const toggleAccept = (id: string) =>
    setChanges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "accepted" ? "rejected" : "accepted",
            }
          : c
      )
    );

  const reject = (id: string) => updateChange(id, { status: "rejected" });

  const startEdit = (id: string) => updateChange(id, { status: "editing" });

  const saveEdit = (id: string) => {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "accepted", rewritten: c.editedText }
          : c
      )
    );
  };

  const cancelEdit = (id: string) => {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "accepted", editedText: c.rewritten }
          : c
      )
    );
  };

  /* ---- derived --------------------------------------------------- */

  const acceptedChanges = changes.filter(
    (c) => c.status === "accepted" || c.status === "editing"
  );
  const acceptedCount = acceptedChanges.length;
  const totalChanges = changes.length;

  /* ---- apply ----------------------------------------------------- */

  const collectChanges = (onlyAccepted: boolean) => {
    const payload: { fieldPath: string; value: string }[] = [];

    const subset = onlyAccepted
      ? changes.filter((c) => c.status === "accepted")
      : changes;

    subset.forEach((c) => {
      payload.push({ fieldPath: c.fieldPath, value: c.rewritten });
    });

    // Skills
    result.skills_to_add.forEach((skill) => {
      payload.push({ fieldPath: "skills.add", value: skill });
    });

    return payload;
  };

  const handleAcceptAll = () => {
    // Accept everything first
    setChanges((prev) =>
      prev.map((c) => ({ ...c, status: "accepted" as ChangeStatus }))
    );
    const payload: { fieldPath: string; value: string }[] = changes.map(
      (c) => ({ fieldPath: c.fieldPath, value: c.rewritten })
    );
    result.skills_to_add.forEach((skill) => {
      payload.push({ fieldPath: "skills.add", value: skill });
    });
    onApply(payload);
    onClose();
  };

  const handleApplySelected = () => {
    onApply(collectChanges(true));
    onClose();
  };

  /* ---- group changes by label ------------------------------------ */

  const grouped: Record<string, TrackedChange[]> = {};
  changes.forEach((c) => {
    if (!grouped[c.label]) grouped[c.label] = [];
    grouped[c.label].push(c);
  });

  /* ---- render ---------------------------------------------------- */

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[40vw] min-w-[400px] max-w-[700px] overflow-hidden p-0 flex flex-col h-full"
        data-testid="fix-all-drawer"
      >
        {/* Accessible title (visually rendered in custom header) */}
        <SheetTitle className="sr-only">Review AI Changes</SheetTitle>

        {/* ---- HEADER ---- */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "0.5px solid #E0D8CC",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: 15, fontWeight: 700, color: "#0C1A0E" }}
              >
                Review AI Changes
              </div>
              <div
                style={{ fontSize: 11, color: "#78716C", marginTop: 2 }}
              >
                Estimated score improvement: +
                {result.estimated_score_improvement} pts
              </div>
            </div>
          </div>
        </div>

        {/* ---- CONTENT (scrollable) ---- */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div>
                {Object.entries(grouped).map(([label, groupChanges]) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#78716C",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 8,
                      }}
                    >
                      {label}
                    </div>

                    {groupChanges.map((change) => (
                      <div
                        key={change.id}
                        style={{
                          marginBottom: 10,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "0.5px solid #E0D8CC",
                        }}
                      >
                        {change.original && (
                          <div
                            style={{
                              background: "#FEF2F2",
                              padding: "8px 12px",
                              display: "flex",
                              gap: 8,
                            }}
                          >
                            <span style={{ color: "#DC2626", fontWeight: 700, flexShrink: 0 }}>&minus;</span>
                            <span style={{ fontSize: 12, color: "#DC2626", lineHeight: 1.6 }}>{change.original}</span>
                          </div>
                        )}
                        <div
                          style={{
                            background: "#F0FDF4",
                            padding: "8px 12px",
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <span style={{ color: "#15803d", fontWeight: 700, flexShrink: 0 }}>+</span>
                          <span style={{ fontSize: 12, color: "#15803d", lineHeight: 1.6 }}>
                            {change.status === "editing" ? change.editedText : change.rewritten}
                          </span>
                        </div>
                        <div
                          style={{
                            background: "#FAFAF9",
                            padding: "6px 12px",
                            display: "flex",
                            gap: 8,
                            borderTop: "0.5px solid #E0D8CC",
                          }}
                        >
                          {change.status === "editing" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                              <Textarea
                                value={change.editedText}
                                onChange={(e) => updateChange(change.id, { editedText: e.target.value })}
                                style={{ fontSize: 12, minHeight: 60 }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => saveEdit(change.id)} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, border: "none", cursor: "pointer", background: "#DCFCE7", color: "#15803d", display: "flex", alignItems: "center", gap: 3 }}>
                                  <Check size={10} /> Save
                                </button>
                                <button onClick={() => cancelEdit(change.id)} style={{ fontSize: 10, color: "#78716C", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                                  <X size={10} /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => toggleAccept(change.id)} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, border: "none", cursor: "pointer", background: change.status === "accepted" ? "#DCFCE7" : "#F3F4F6", color: change.status === "accepted" ? "#15803d" : "#6B7280" }}>
                                {change.status === "accepted" ? "\u2713 Accepted" : "Accept"}
                              </button>
                              <button onClick={() => reject(change.id)} style={{ fontSize: 10, color: "#78716C", background: "none", border: "none", cursor: "pointer" }}>Keep original</button>
                              <button onClick={() => startEdit(change.id)} style={{ fontSize: 10, color: "#78716C", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                                <Pencil size={10} /> Edit
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {result.skills_to_add.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>+ Skills to add</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.skills_to_add.map((skill) => (
                        <span key={skill} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 100, background: "#F0FDF4", color: "#15803d", border: "0.5px solid #BBF7D0" }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.sections_needing_attention.map((s) => (
                  <div key={s.section} style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#FFFBEB", border: "0.5px solid #FDE68A", fontSize: 10, color: "#92400E" }}>
                    &#x26A0; {s.message}
                  </div>
                ))}
              </div>
            </div>

        {/* ---- FOOTER (sticky) ---- */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "white",
            padding: 16,
            borderTop: "0.5px solid #E0D8CC",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{ fontSize: 11, color: "#78716C", textAlign: "center" }}
          >
            Accepting {acceptedCount} of {totalChanges} changes
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAcceptAll}
              data-testid="btn-accept-all"
              style={{
                flex: 1,
                background: "#15803d",
                color: "white",
                border: "none",
                padding: 11,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Accept All &amp; Apply
            </button>
            <button
              onClick={handleApplySelected}
              data-testid="btn-apply-selected"
              style={{
                flex: 1,
                background: "white",
                color: "#15803d",
                border: "1px solid #15803d",
                padding: 11,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Apply Selected ({acceptedCount})
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
