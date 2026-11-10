"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AtsReportData, FieldRef } from "@/lib/ai/ats-analyser";
import { isLockedReport, type LockedAtsReport } from "@/lib/ats/redact";
import type { ClientScoreResult } from "@/lib/ats/client-scorer";
import type { ResumeContent } from "@/lib/resume/types";
import { AiRewriteDrawer } from "@/components/resume/ai-rewrite-drawer";
import { FixAllDrawer, type FixAllResult } from "@/components/resume/fix-all-drawer";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { useActivity } from "@/lib/analytics/useActivity";
import { PanelButton } from "@/components/ats/ats-ui";
import { ScoreCard, type CategoryTile } from "@/components/ats/score-card";
import { FixList, groupDomId, type FixGroup, type FixItem } from "@/components/ats/fix-list";
import { LockedReport } from "@/components/ats/locked-report";
import {
  AfterFixAll,
  AllClear,
  FixAllRunning,
  FullPanelError,
  GuaranteeClaim,
  InlineNotice,
  PreScan,
  Scanning,
  toPanelError,
  type FixAllComparison,
  type PanelError,
  type PrecheckItem,
  type ScanStep,
} from "@/components/ats/panel-states";
import {
  categoryName,
  flushSave,
  formatTimeAgo,
  isSuggestion,
  issueKey,
  jumpToField,
  overallTone,
  plural,
} from "@/components/ats/ats-helpers";

type ReportMeta = { id: string; score: number; created_at: string };
/** Pro gets the full report; the free plan gets the server-redacted view (see lib/ats/redact.ts). */
type AtsPanelReport = (Partial<AtsReportData> | LockedAtsReport) & ReportMeta;

interface AtsPanelProps {
  cvId: string;
  report: AtsPanelReport | null;
  estimatedScore?: ClientScoreResult | null;
  currentSkills?: string[];
  content?: ResumeContent;
  onRewriteAccept?: (newText: string, fieldRef: FieldRef) => void;
  plan?: string;
  autoScan?: boolean;
}

const REWRITABLE_SECTIONS = new Set(["experience", "summary", "projects", "volunteering"]);
/** Tile order on the score card; unknown categories follow. */
const TILE_ORDER = ["keywords", "bullet_quality", "measurable_results", "formatting", "contact", "sections"];

/* ── Reading the CV for rewrite context ── */

function findOriginalText(content: ResumeContent | undefined, ref: FieldRef): string {
  if (!content) return "";
  if (ref.section === "summary") return content.summary?.content ?? "";
  const bullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []);
  if (ref.section === "experience" && ref.bulletText) {
    const needle = ref.bulletText.toLowerCase().slice(0, 40);
    const hit = bullets.find((b) => b.toLowerCase().includes(needle));
    if (hit) return hit;
  }
  if (ref.section === "experience" && ref.index != null && bullets[ref.index]) return bullets[ref.index];
  // The AI didn't quote a bullet (or it was edited since): offer the first one
  // so Rewrite still opens with something to work on.
  if (ref.section === "experience") return bullets[0] ?? "";
  return "";
}

function findSectionLabel(content: ResumeContent | undefined, ref: FieldRef): string {
  if (ref.section === "summary") return "Summary";
  if (ref.section === "experience" && ref.bulletText && content) {
    const needle = ref.bulletText.toLowerCase().slice(0, 40);
    for (const item of content.experience?.items ?? []) {
      if ((item.bullets ?? []).some((b) => b.toLowerCase().includes(needle))) {
        return `Work Experience · ${[item.role, item.company].filter(Boolean).join(" at ")}`;
      }
    }
  }
  return ref.section;
}

function precheck(content: ResumeContent | undefined): PrecheckItem[] {
  const hasBody = !!(
    content?.experience?.items?.length ||
    content?.projects?.items?.length ||
    content?.education?.items?.length ||
    content?.volunteering?.items?.length
  );
  return [
    { label: "Name", section: "contact", done: !!content?.contact?.name?.trim() },
    { label: "Email", section: "contact", done: !!content?.contact?.email?.trim() },
    { label: "Experience, projects or education", section: "experience", done: hasBody },
    { label: "Skills", section: "skills", done: !!content?.skills?.categories?.length },
  ];
}

export function AtsPanel({
  cvId,
  report: initialReport,
  estimatedScore,
  currentSkills,
  content,
  onRewriteAccept,
  plan = "free",
  autoScan = false,
}: AtsPanelProps) {
  const router = useRouter();
  const { log } = useActivity();
  const { openUpgradeModal } = useUpgradeModal();

  const [report, setReport] = useState<AtsPanelReport | null>(initialReport);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>("reading");
  const [error, setError] = useState<(PanelError & { source: "scan" | "fix_all" }) | null>(null);

  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());
  const [addressedIssues, setAddressedIssues] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string> | null>(null);

  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [rewriteIssue, setRewriteIssue] = useState<{ description: string; fix: string; category: string; field_ref?: FieldRef } | null>(null);
  const [rewriteOriginal, setRewriteOriginal] = useState("");

  const [fixAllRunning, setFixAllRunning] = useState(false);
  const [fixAllStep, setFixAllStep] = useState(0);
  const [fixAllResult, setFixAllResult] = useState<FixAllResult | null>(null);
  const [fixAllOpen, setFixAllOpen] = useState(false);
  const fixAllAbort = useRef<AbortController | null>(null);
  const [comparison, setComparison] = useState<FixAllComparison | null>(null);

  const lockedReport = report && isLockedReport(report) ? report : null;
  const fullReport = report && !isLockedReport(report) ? report : null;
  const isPro = plan === "pro";

  const verifiedScore = report?.score ?? 0;
  const displayScore = estimatedScore ? estimatedScore.estimated_score : verifiedScore;
  const isEstimated = !!estimatedScore && estimatedScore.estimated_score !== verifiedScore;
  const targetRole = content?.targetTitle?.title?.trim() || undefined;

  // A new report starts a fresh session of added keywords, addressed issues and open groups.
  useEffect(() => {
    setAddedKeywords(new Set());
    setAddressedIssues(new Set());
    setOpenGroups(null);
  }, [report]);

  /* ── Scan ── */

  useEffect(() => {
    if (!scanning) return;
    const timers = [setTimeout(() => setScanStep("keywords"), 2000), setTimeout(() => setScanStep("scoring"), 4500)];
    return () => timers.forEach(clearTimeout);
  }, [scanning]);

  const handleAnalyse = useCallback(
    async (opts: { force?: boolean } = {}): Promise<AtsPanelReport | null> => {
      if (!opts.force && content) {
        const missing = precheck(content).filter((c) => !c.done);
        if (missing.length > 0) {
          setError({ kind: "incomplete", missing, source: "scan" });
          return null;
        }
      }

      setScanning(true);
      setScanStep("reading");
      setError(null);
      try {
        // The scan reads the saved CV, so push any pending edits first.
        await flushSave();
        const res = await fetch("/api/cv/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv_id: cvId }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const err = toPanelError(res, data);
          if (err.kind === "scan_used") log("Hit ATS scan limit");
          setError({ ...err, source: "scan" });
          return null;
        }
        setScanStep("done");
        await new Promise((r) => setTimeout(r, 600));
        setReport(data);
        log("Ran ATS analysis", { score: data?.overall_score ?? data?.score });
        router.refresh();
        return data as AtsPanelReport;
      } catch {
        setError({ ...toPanelError(null, null), source: "scan" });
        return null;
      } finally {
        setScanning(false);
      }
    },
    [cvId, content, log, router]
  );

  // First landing after an upload: scan straight away.
  useEffect(() => {
    if (autoScan && !initialReport) handleAnalyse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fix all ── */

  async function handleFixAll() {
    if (lockedReport || !isPro) {
      openUpgradeModal("fix_all_limit");
      return;
    }
    const controller = new AbortController();
    fixAllAbort.current = controller;
    setFixAllRunning(true);
    setFixAllStep(0);
    setError(null);
    const timers = [setTimeout(() => setFixAllStep(1), 2500), setTimeout(() => setFixAllStep(2), 5000)];
    try {
      await flushSave();
      const res = await fetch("/api/cv/fix-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 403 && data?.code === "fix_all_limit") {
          openUpgradeModal("fix_all_limit");
          return;
        }
        const err = toPanelError(res, data);
        const kind = err.kind === "generic" || err.kind === "ai_down" || err.kind === "scan_used" ? "fix_all" : err.kind;
        setError({ ...err, kind, message: kind === "fix_all" ? undefined : err.message, source: "fix_all" });
        return;
      }
      setFixAllResult(data as FixAllResult);
      setFixAllOpen(true);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        const err = toPanelError(null, null);
        setError({ ...err, kind: err.kind === "offline" ? "offline" : "fix_all", source: "fix_all" });
      }
    } finally {
      timers.forEach(clearTimeout);
      fixAllAbort.current = null;
      setFixAllRunning(false);
    }
  }

  function handleFixAllApply(changes: { fieldPath: string; value: string }[]) {
    for (const change of changes) {
      if (change.fieldPath === "skills.add") {
        window.dispatchEvent(new CustomEvent("add-skill", { detail: { skill: change.value } }));
      } else {
        window.dispatchEvent(new CustomEvent("rewrite-accept", { detail: { newText: change.value, fieldRef: parseFieldPath(change.fieldPath) } }));
      }
    }
    const beforeCats = fullReport?.category_scores ?? {};
    const before: FixAllComparison = { applied: changes.length, before: verifiedScore, after: null, categories: [] };
    setComparison(before);
    // Let the editor take the changes, then re-scan (handleAnalyse saves first).
    setTimeout(async () => {
      const next = await handleAnalyse({ force: true });
      if (!next || isLockedReport(next)) {
        setComparison(null);
        return;
      }
      const afterCats = next.category_scores ?? {};
      const categories = Object.keys(afterCats)
        .map((key) => ({ key, before: beforeCats[key]?.score ?? afterCats[key].score, after: afterCats[key].score }))
        .sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before));
      setComparison({ ...before, after: next.score, categories });
    }, 400);
  }

  function parseFieldPath(path: string): FieldRef {
    if (path === "summary.content") return { section: "summary", field: "content" };
    const match = path.match(/^experience\.items\.(\d+)\.bullets\.(\d+)$/);
    if (match && content) {
      const bullet = content.experience?.items?.[Number(match[1])]?.bullets?.[Number(match[2])];
      return { section: "experience", field: "bullets", bulletText: bullet || undefined };
    }
    return { section: "experience", field: null };
  }

  /* ── Issue actions ── */

  function handleFix(issue: { field_ref?: FieldRef }) {
    if (issue.field_ref) jumpToField(issue.field_ref);
  }

  function handleRewrite(item: FixItem) {
    const ref = item.issue.field_ref;
    if (!ref) return;
    const original = findOriginalText(content, ref);
    if (!original) return;
    setRewriteIssue({ description: item.issue.description, fix: item.issue.fix, category: item.category, field_ref: ref });
    setRewriteOriginal(original);
    setRewriteOpen(true);
  }

  function handleAddKeyword(keyword: string) {
    if (addedKeywords.has(keyword)) return;
    window.dispatchEvent(new CustomEvent("add-skill", { detail: { skill: keyword } }));
    setAddedKeywords((prev) => new Set(prev).add(keyword));
  }

  /* ── Derived report view ── */

  const effectiveKeywords = useMemo(() => {
    if (!fullReport?.keywords) return null;
    if (estimatedScore?.keywords_matched || estimatedScore?.keywords_missing) {
      return { found: estimatedScore.keywords_matched ?? [], missing: estimatedScore.keywords_missing ?? [] };
    }
    const skillsLower = new Set((currentSkills ?? []).map((s) => s.toLowerCase()));
    const found = [...(fullReport.keywords.found ?? [])];
    const missing: string[] = [];
    for (const kw of fullReport.keywords.missing ?? []) {
      if (skillsLower.has(kw.toLowerCase())) {
        if (!found.some((f) => f.toLowerCase() === kw.toLowerCase())) found.push(kw);
      } else {
        missing.push(kw);
      }
    }
    return { found, missing };
  }, [fullReport?.keywords, currentSkills, estimatedScore?.keywords_matched, estimatedScore?.keywords_missing]);

  const groups = useMemo<FixGroup[]>(() => {
    if (!fullReport?.category_scores) return [];
    const list: FixGroup[] = Object.entries(fullReport.category_scores).map(([key, cat]) => {
      const shown = isEstimated ? estimatedScore?.category_scores?.[key]?.score ?? cat.score : cat.score;
      const items = [...(cat.issues ?? [])]
        .sort((a, b) => (b.impact ?? 0) - (a.impact ?? 0))
        .map((issue): FixItem => {
          const suggestion = isSuggestion(issue, cat.score);
          const ref = issue.field_ref;
          const original = ref ? findOriginalText(content, ref) : "";
          return {
            id: issueKey(key, issue),
            category: key,
            issue,
            suggestion,
            addressed: addressedIssues.has(issueKey(key, issue)),
            quote: ref?.bulletText ? original || ref.bulletText : undefined,
            canRewrite: !suggestion && !!content && !!ref && REWRITABLE_SECTIONS.has(ref.section) && !!original,
          };
        });
      return {
        key,
        title: categoryName(key),
        score: shown,
        items,
        keywords: key === "keywords" && effectiveKeywords ? effectiveKeywords : undefined,
      };
    });
    if (effectiveKeywords && !list.some((g) => g.key === "keywords") && (effectiveKeywords.missing.length || effectiveKeywords.found.length)) {
      list.push({ key: "keywords", title: "Keywords", items: [], keywords: effectiveKeywords });
    }
    const needsWork = (g: FixGroup) => g.items.some((i) => !i.suggestion && !i.addressed) || (g.keywords?.missing.length ?? 0) > 0;
    list.sort((a, b) => Number(needsWork(b)) - Number(needsWork(a)) || (a.score ?? 100) - (b.score ?? 100));

    const enhancements = (fullReport.enhancements ?? [])
      .map((e) => (typeof e === "string" ? e : (e as { description?: string })?.description ?? ""))
      .filter(Boolean);
    if (enhancements.length) {
      list.push({
        key: "suggestions",
        title: "Suggestions",
        items: enhancements.map((text, i) => ({
          id: `suggestion::${i}`,
          category: "suggestions",
          issue: { description: text, fix: "", impact: 0 },
          suggestion: true,
          addressed: false,
          canRewrite: false,
        })),
      });
    }
    return list;
  }, [fullReport, isEstimated, estimatedScore?.category_scores, content, addressedIssues, effectiveKeywords]);

  const openIssues = groups.flatMap((g) => g.items).filter((i) => !i.suggestion && !i.addressed);
  const missingKeywordCount = effectiveKeywords?.missing.filter((k) => !addedKeywords.has(k)).length ?? 0;
  const allClear = !!fullReport && openIssues.length === 0 && missingKeywordCount === 0;

  // Worst category that needs work opens first; the rest stay folded.
  const defaultOpen = useMemo(() => {
    const first = groups.find((g) => g.items.some((i) => !i.suggestion) || (g.keywords?.missing.length ?? 0) > 0);
    return new Set(first ? [first.key] : []);
  }, [groups]);
  const openKeys = openGroups ?? defaultOpen;

  function toggleGroup(key: string) {
    const next = new Set(openKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpenGroups(next);
  }

  function revealGroup(key: string) {
    setOpenGroups(new Set(openKeys).add(key));
    requestAnimationFrame(() => document.getElementById(groupDomId(key))?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const tiles = useMemo<CategoryTile[] | undefined>(() => {
    const cats = fullReport?.category_scores;
    if (!cats) return undefined;
    const keys = Object.keys(cats).sort((a, b) => {
      const ia = TILE_ORDER.indexOf(a);
      const ib = TILE_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return keys.map((key) => {
      const group = groups.find((g) => g.key === key);
      const verified = cats[key].score;
      const estimate = isEstimated ? estimatedScore?.category_scores?.[key]?.score : undefined;
      return {
        key,
        score: estimate ?? verified,
        previous: estimate != null && estimate !== verified ? verified : undefined,
        issues: group?.items.filter((i) => !i.suggestion && !i.addressed).length ?? 0,
        suggestions: group?.items.filter((i) => i.suggestion).length ?? 0,
        changed: isEstimated && (estimatedScore?.changed_categories?.includes(key) ?? false),
      };
    });
  }, [fullReport, groups, isEstimated, estimatedScore]);

  const projection = useMemo(() => {
    const tone = overallTone(displayScore);
    if (lockedReport) {
      const teaser = lockedReport.teaser_issues;
      const gain = teaser.reduce((s, i) => s + Math.max(0, i.impact), 0);
      if (!teaser.length || gain <= 0) return null;
      return { text: `Fix the ${plural(teaser.length, "issue", "issues")} below to reach about ${Math.min(100, displayScore + gain)}`, tone };
    }
    if (!fullReport) return null;
    if (allClear) return displayScore >= 90 ? { text: "Nothing left to fix. Match it against a job next.", tone } : null;
    const gain = openIssues.reduce((s, i) => s + Math.max(0, i.issue.impact ?? 0), 0);
    if (gain > 0) return { text: `Fixing the ${plural(openIssues.length, "issue", "issues")} below could take you to about ${Math.min(100, displayScore + gain)}`, tone };
    if (missingKeywordCount > 0) return { text: `Adding the ${plural(missingKeywordCount, "missing keyword", "missing keywords")} could raise your score`, tone };
    return null;
  }, [lockedReport, fullReport, allClear, openIssues, missingKeywordCount, displayScore]);

  /* ── Render ── */

  const retry = () => (error?.source === "fix_all" ? handleFixAll() : handleAnalyse());
  const retryForce = () => handleAnalyse({ force: true });
  const upgradeForScans = () => openUpgradeModal("ats_limit");
  const showLockedAllClear =
    !!lockedReport &&
    lockedReport.teaser_issues.length === 0 &&
    lockedReport.hidden.issues + lockedReport.hidden.missing_keywords + lockedReport.hidden.suggestions === 0;

  if (!report) {
    return (
      <div data-panel="ats" className="flex flex-col gap-4">
        {scanning ? (
          <Scanning step={scanStep} role={targetRole} />
        ) : error ? (
          <FullPanelError error={error} onRetry={retry} onTryAnyway={retryForce} onUpgrade={upgradeForScans} />
        ) : (
          <PreScan checks={precheck(content)} role={targetRole} onScan={() => handleAnalyse()} />
        )}
      </div>
    );
  }

  const busy = scanning || fixAllRunning;
  const outOfDate = isEstimated && !!lockedReport;

  return (
    <div data-panel="ats" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold leading-tight tracking-[-0.02em] text-[#0C1A0E] sm:text-[22px]">ATS analysis</h2>
          <span className={cn("text-[13px]", outOfDate ? "font-semibold text-warning" : "text-[#5F5954]")}>
            {outOfDate ? "Out of date, you've edited since" : `Scanned ${formatTimeAgo(report.created_at)}`}
          </span>
        </div>
        <PanelButton onClick={() => handleAnalyse()} disabled={busy} aria-label="Re-scan" data-testid="btn-reanalyse" className="w-11 px-0 sm:w-auto sm:px-4">
          <RefreshCw className={cn("h-4 w-4", scanning && "animate-spin")} aria-hidden="true" />
          <span className="hidden sm:inline">Re-scan</span>
        </PanelButton>
      </header>

      {error && (
        <InlineNotice error={error} onRetry={retry} onTryAnyway={retryForce} onUpgrade={upgradeForScans} onDismiss={() => setError(null)} />
      )}

      {fixAllRunning && <FixAllRunning step={fixAllStep} onCancel={() => fixAllAbort.current?.abort()} />}

      {comparison && <AfterFixAll result={comparison} onDismiss={() => setComparison(null)} />}

      <ScoreCard
        score={displayScore}
        verifiedScore={verifiedScore}
        isEstimated={isEstimated}
        confidence={(report.confidence ?? "medium") as "high" | "medium" | "low"}
        projection={projection}
        tiles={fullReport ? tiles : undefined}
        onTileClick={fullReport ? revealGroup : undefined}
        rescanning={scanning}
        onRescan={() => handleAnalyse()}
      />

      {lockedReport &&
        (showLockedAllClear ? (
          <AllClear score={displayScore} onFixAll={handleFixAll} />
        ) : (
          <LockedReport report={lockedReport} score={displayScore} onFix={handleFix} onUpgrade={upgradeForScans} onFixAll={handleFixAll} />
        ))}

      {fullReport &&
        (allClear ? (
          <AllClear score={displayScore} onFixAll={handleFixAll} />
        ) : (
          <FixList
            groups={groups}
            openKeys={openKeys}
            onToggle={toggleGroup}
            onFix={(i) => handleFix(i.issue)}
            onRewrite={handleRewrite}
            added={addedKeywords}
            onAddKeyword={handleAddKeyword}
            onFixAll={handleFixAll}
            fixAllDisabled={busy || displayScore >= 95}
            fixAllLocked={!isPro}
          />
        ))}

      {fullReport && isPro && displayScore < 80 && <GuaranteeClaim score={displayScore} />}

      {/* Phones: Fix all stays in reach while scrolling the list. */}
      {fullReport && !allClear && !fixAllRunning && (
        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 border-t border-[#E0D8CC] bg-[#F7F5F0] px-4 pb-6 pt-3 lg:hidden">
          <PanelButton variant="primary" className="h-[50px] w-full rounded-[14px] text-[15px]" onClick={handleFixAll} disabled={busy || displayScore >= 95}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Fix all with AI
          </PanelButton>
        </div>
      )}

      {rewriteIssue && (
        <AiRewriteDrawer
          open={rewriteOpen}
          onClose={() => setRewriteOpen(false)}
          issue={rewriteIssue}
          originalText={rewriteOriginal}
          targetRole={targetRole ?? "General"}
          sectionType={rewriteIssue.field_ref?.section ?? "experience"}
          sectionLabel={rewriteIssue.field_ref ? findSectionLabel(content, rewriteIssue.field_ref) : ""}
          isCurrent={true}
          missingKeywords={effectiveKeywords?.missing ?? []}
          onAccept={(text, ref) => {
            onRewriteAccept?.(text, ref);
            setAddressedIssues((prev) => new Set(prev).add(issueKey(rewriteIssue.category, rewriteIssue)));
          }}
        />
      )}

      {fixAllResult && (
        <FixAllDrawer open={fixAllOpen} onClose={() => setFixAllOpen(false)} result={fixAllResult} currentScore={displayScore} onApply={handleFixAllApply} />
      )}
    </div>
  );
}
