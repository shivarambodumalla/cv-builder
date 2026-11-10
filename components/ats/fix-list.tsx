"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown, HelpCircle, Plus, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AtsIssue } from "@/lib/ai/ats-analyser";
import { Card, PanelButton, PointsTile, ProPill } from "@/components/ats/ats-ui";
import { TONE_PILL, canJump, categoryTone, plural } from "@/components/ats/ats-helpers";

export interface FixItem {
  id: string;
  category: string;
  issue: AtsIssue;
  /** Advice that adds no points: shown with a dashed tile and no actions. */
  suggestion: boolean;
  addressed: boolean;
  /** The bullet the issue points at, quoted under the title. */
  quote?: string;
  canRewrite: boolean;
}

export interface FixGroup {
  key: string;
  title: string;
  /** Category score; absent for the general Suggestions group. */
  score?: number;
  items: FixItem[];
  keywords?: { missing: string[]; found: string[] };
}

export function groupDomId(key: string) {
  return `ats-group-${key}`;
}

/* ── Rows ── */

function IssueRow({ item, onFix, onRewrite }: { item: FixItem; onFix: (i: FixItem) => void; onRewrite: (i: FixItem) => void }) {
  const { issue, addressed } = item;
  if (item.suggestion) {
    return (
      <div className="flex gap-3.5 border-t border-[#EFE9DF] px-4 py-3.5 sm:px-6">
        <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#C9C0B2] sm:h-12 sm:w-12">
          <HelpCircle className="h-[18px] w-[18px] text-[#5F5954]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <h3 className="text-sm font-medium leading-snug text-[#5F5954]">{issue.description}</h3>
          {issue.fix && issue.fix !== issue.description && <p className="text-[13px] leading-normal text-[#8A827A]">{issue.fix}</p>}
        </div>
      </div>
    );
  }

  const jumpable = canJump(issue.field_ref);
  const jumpLabel = issue.field_ref?.bulletText ? "Go to bullet" : "Go to field";
  return (
    <div className={cn("flex gap-3.5 border-t border-[#EFE9DF] px-4 py-4 sm:gap-4 sm:px-6 sm:py-[18px]", addressed && "opacity-70")}>
      <PointsTile points={issue.impact} addressed={addressed} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <h3 className={cn("text-sm font-semibold leading-snug sm:text-[15px]", addressed ? "text-[#5F5954] line-through" : "text-[#0C1A0E]")}>
            {issue.description}
          </h3>
          {addressed ? (
            <span className="text-xs font-semibold text-[#065F46]">Addressed · re-scan to confirm +{issue.impact}</span>
          ) : (
            issue.fix && <p className="text-[13px] leading-normal text-[#5F5954]">{issue.fix}</p>
          )}
        </div>
        {!addressed && item.quote && (
          <blockquote className="rounded-r-lg border-l-[3px] border-[#E0D8CC] bg-[#FBFAF7] px-3 py-2.5 text-[13px] leading-normal text-[#5F5954]">
            “{item.quote}”
          </blockquote>
        )}
        {!addressed && (jumpable || item.canRewrite) && (
          <div className="flex flex-wrap gap-2">
            {jumpable && (
              <PanelButton size="sm" onClick={() => onFix(item)}>
                <ArrowRight className="h-[13px] w-[13px]" aria-hidden="true" />
                {jumpLabel}
              </PanelButton>
            )}
            {item.canRewrite && (
              <PanelButton size="sm" variant="navy" onClick={() => onRewrite(item)}>
                <Wand2 className="h-[13px] w-[13px]" aria-hidden="true" />
                Rewrite with AI
              </PanelButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const VISIBLE_CHIPS = 8;
const VISIBLE_FOUND = 5;

function KeywordBlock({
  missing,
  found,
  added,
  onAdd,
}: {
  missing: string[];
  found: string[];
  added: Set<string>;
  onAdd: (kw: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [showFound, setShowFound] = useState(false);
  const shown = showAll ? missing : missing.slice(0, VISIBLE_CHIPS);
  const addedCount = missing.filter((k) => added.has(k)).length;
  const foundShown = showFound ? found : found.slice(0, VISIBLE_FOUND);

  return (
    <div className="flex gap-3.5 border-t border-[#EFE9DF] px-4 py-4 sm:gap-4 sm:px-6 sm:py-[18px]">
      <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF6F1] sm:h-[52px] sm:w-[52px]">
        <Plus className="h-5 w-5 text-[#065F46]" strokeWidth={2.5} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {missing.length > 0 && (
          <>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold leading-snug text-[#0C1A0E] sm:text-[15px]">{plural(missing.length, "missing keyword", "missing keywords")}</h3>
              <p className="text-[13px] leading-normal text-[#5F5954]">
                {addedCount > 0
                  ? `${addedCount} of ${missing.length} added to your skills.`
                  : "Add only the ones that match your real experience. Tap one to add it to your skills."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {shown.map((kw) => {
                const on = added.has(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    aria-pressed={on}
                    disabled={on}
                    onClick={() => onAdd(kw)}
                    className={cn(
                      "inline-flex h-11 max-w-full items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#0C1A0E] transition-colors sm:h-[34px]",
                      on
                        ? "cursor-default border border-[#065F46] bg-[#EEF6F1]"
                        : "border border-dashed border-[#B9B0A2] bg-white hover:border-solid hover:border-[#065F46] hover:bg-[#EEF6F1]"
                    )}
                  >
                    {on ? (
                      <Check className="h-3 w-3 shrink-0 text-[#065F46]" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <Plus className="h-3 w-3 shrink-0 text-[#065F46]" strokeWidth={3} aria-hidden="true" />
                    )}
                    <span className="truncate">{kw}</span>
                  </button>
                );
              })}
              {missing.length > VISIBLE_CHIPS && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="h-11 rounded-full border border-[#E0D8CC] bg-white px-3 text-[13px] font-semibold text-[#065F46] hover:bg-[#F7F5F0] sm:h-[34px]"
                >
                  {showAll ? "Show fewer" : `+ ${missing.length - VISIBLE_CHIPS} more`}
                </button>
              )}
            </div>
          </>
        )}
        {found.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F5954]">Already in your resume</span>
            <span className="text-xs leading-relaxed text-[#5F5954]">
              {foundShown.join(", ")}
              {found.length > VISIBLE_FOUND && (
                <>
                  {" "}
                  <button type="button" onClick={() => setShowFound((v) => !v)} className="font-semibold text-[#065F46] hover:underline">
                    {showFound ? "show fewer" : `and ${found.length - VISIBLE_FOUND} more`}
                  </button>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Group ── */

function groupCountLabel(group: FixGroup): string | null {
  const open = group.items.filter((i) => !i.suggestion);
  const tips = group.items.filter((i) => i.suggestion);
  const parts: string[] = [];
  if (open.length) parts.push(plural(open.length, "issue", "issues"));
  if (tips.length) parts.push(plural(tips.length, "suggestion", "suggestions"));
  const missing = group.keywords?.missing.length ?? 0;
  if (missing) parts.push(plural(missing, "keyword", "keywords"));
  return parts.length ? parts.join(" · ") : null;
}

function Group({
  group,
  open,
  onToggle,
  onFix,
  onRewrite,
  added,
  onAddKeyword,
}: {
  group: FixGroup;
  open: boolean;
  onToggle: () => void;
  onFix: (i: FixItem) => void;
  onRewrite: (i: FixItem) => void;
  added: Set<string>;
  onAddKeyword: (kw: string) => void;
}) {
  const count = groupCountLabel(group);
  const panelId = `${groupDomId(group.key)}-panel`;
  const hasKeywords = !!group.keywords && (group.keywords.missing.length > 0 || group.keywords.found.length > 0);
  const empty = group.items.length === 0 && !hasKeywords;
  return (
    <div id={groupDomId(group.key)} className="scroll-mt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-11 w-full items-center gap-2.5 border-t border-[#EFE9DF] bg-[#FBFAF7] px-4 py-3 text-left hover:bg-[#F7F5F0] sm:px-6"
      >
        <span className="text-sm font-semibold text-[#0C1A0E]">{group.title}</span>
        {group.score != null && (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", TONE_PILL[categoryTone(group.score)])}>{group.score}</span>
        )}
        {count && <span className="text-[13px] text-[#5F5954]">{count}</span>}
        <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-[#5F5954] transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId}>
          {group.items.map((item) => (
            <IssueRow key={item.id} item={item} onFix={onFix} onRewrite={onRewrite} />
          ))}
          {hasKeywords && <KeywordBlock missing={group.keywords!.missing} found={group.keywords!.found} added={added} onAdd={onAddKeyword} />}
          {empty && (
            <div className="flex items-center gap-2.5 border-t border-[#EFE9DF] px-4 py-3.5 text-[13px] text-[#5F5954] sm:px-6">
              <Check className="h-4 w-4 text-success" strokeWidth={2.5} aria-hidden="true" />
              No issues in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Card ── */

export function FixList({
  groups,
  openKeys,
  onToggle,
  onFix,
  onRewrite,
  added,
  onAddKeyword,
  onFixAll,
  fixAllDisabled,
  fixAllLocked,
}: {
  groups: FixGroup[];
  openKeys: Set<string>;
  onToggle: (key: string) => void;
  onFix: (i: FixItem) => void;
  onRewrite: (i: FixItem) => void;
  added: Set<string>;
  onAddKeyword: (kw: string) => void;
  onFixAll: () => void;
  fixAllDisabled: boolean;
  /** Free plan: the button opens the upgrade modal and carries a Pro tag. */
  fixAllLocked: boolean;
}) {
  return (
    <Card aria-labelledby="ats-fix-title">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-0.5">
          <h2 id="ats-fix-title" className="text-base font-bold leading-snug text-[#0C1A0E] sm:text-[17px]">What to fix</h2>
          <span className="text-[13px] text-[#5F5954]">Worst category first, biggest wins at the top</span>
        </div>
        <PanelButton
          variant={fixAllLocked ? "outline" : "primary"}
          onClick={onFixAll}
          disabled={fixAllDisabled}
          title={fixAllDisabled ? "Nothing to fix at 95+" : undefined}
          className="hidden lg:inline-flex"
          data-testid="btn-fix-all"
        >
          <Wand2 className={cn("h-4 w-4", fixAllLocked && "text-[#065F46]")} aria-hidden="true" />
          Fix all with AI
          {fixAllLocked && <ProPill />}
        </PanelButton>
      </div>
      {groups.map((g) => (
        <Group
          key={g.key}
          group={g}
          open={openKeys.has(g.key)}
          onToggle={() => onToggle(g.key)}
          onFix={onFix}
          onRewrite={onRewrite}
          added={added}
          onAddKeyword={onAddKeyword}
        />
      ))}
    </Card>
  );
}
