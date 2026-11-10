"use client";

import { Check, Info, ShieldCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TONE_TEXT,
  bandCopy,
  categoryName,
  categoryTone,
  overallTone,
  plural,
  type Tone,
} from "@/components/ats/ats-helpers";
import { Spinner } from "@/components/ats/ats-ui";

/* ── Ring ── */

/** 80px on phones, 104px from sm up; one element so `ats-score` stays unique. */
export function ScoreRing({ score, toneClass }: { score: number; toneClass: string }) {
  const size = 104;
  const stroke = 9;
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-[104px] sm:w-[104px]">
      <svg role="img" aria-label={`ATS score ${score} out of 100`} className="h-full w-full" viewBox={`0 0 ${size} ${size}`} data-testid="ats-score">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-[#EFE9DF]" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn("stroke-current transition-[stroke-dasharray] duration-700", toneClass)}
        />
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-extrabold leading-none tracking-[-0.03em] text-[#0C1A0E] sm:text-[32px]">{score}</span>
        <span className="mt-1 hidden text-xs text-[#5F5954] sm:block">of 100</span>
      </div>
    </div>
  );
}

/* ── Chips ── */

const CONFIDENCE: Record<"high" | "medium" | "low", { label: string; className: string }> = {
  high: { label: "High confidence", className: "bg-success/10 text-success" },
  medium: { label: "Medium confidence", className: "bg-warning/10 text-warning" },
  low: { label: "Low confidence", className: "bg-[#F7F5F0] text-[#5F5954]" },
};

function StatusChip({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", className)}>
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

/* ── Category tiles ── */

export interface CategoryTile {
  key: string;
  score: number;
  /** Verified score, when a live estimate has moved it. */
  previous?: number;
  issues: number;
  suggestions: number;
  changed: boolean;
}

function Tile({ tile, onClick }: { tile: CategoryTile; onClick?: () => void }) {
  const tone = categoryTone(tile.score);
  const status =
    tile.issues > 0
      ? plural(tile.issues, "issue", "issues")
      : tile.suggestions > 0
        ? plural(tile.suggestions, "suggestion", "suggestions")
        : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-[#E0D8CC] hover:bg-[#FBFAF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]",
        tile.changed && "animate-ats-rise"
      )}
    >
      <span className="text-xs font-semibold leading-tight text-[#0C1A0E] [overflow-wrap:anywhere] sm:text-[13px]">
        <span className="sm:hidden">{categoryName(tile.key, true)}</span>
        <span className="hidden sm:inline">{categoryName(tile.key)}</span>
      </span>
      <span className="flex flex-wrap items-baseline gap-x-1.5">
        <span className={cn("text-[22px] font-extrabold leading-none tracking-[-0.02em]", TONE_TEXT[tone])}>{tile.score}</span>
        {tile.previous != null && tile.previous !== tile.score && (
          <span className={cn("text-[11px] font-semibold", tile.score > tile.previous ? "text-success" : "text-error")}>
            {tile.score > tile.previous ? "↑" : "↓"} {tile.previous} → {tile.score}
          </span>
        )}
      </span>
      <span className={cn("inline-flex items-center gap-1 text-[11px] sm:text-xs", status ? "text-[#5F5954]" : "text-success")}>
        {status ?? (
          <>
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            No issues
          </>
        )}
      </span>
    </button>
  );
}

/* ── Card ── */

interface ScoreCardProps {
  score: number;
  verifiedScore: number;
  isEstimated: boolean;
  confidence: "high" | "medium" | "low";
  projection: { text: string; tone: Tone } | null;
  tiles?: CategoryTile[];
  onTileClick?: (key: string) => void;
  rescanning: boolean;
  onRescan: () => void;
}

export function ScoreCard({
  score,
  verifiedScore,
  isEstimated,
  confidence,
  projection,
  tiles,
  onTileClick,
  rescanning,
  onRescan,
}: ScoreCardProps) {
  const band = bandCopy(score);
  const ringTone = isEstimated ? "text-secondary" : TONE_TEXT[overallTone(score)];
  const chip = isEstimated
    ? { label: "Estimated", className: "bg-secondary/10 text-secondary" }
    : CONFIDENCE[confidence] ?? CONFIDENCE.medium;

  return (
    <section aria-labelledby="ats-score-title" className="overflow-hidden rounded-2xl bg-white">
      {rescanning && (
        <div role="status" className="flex items-center gap-2.5 border-b border-[#E0D8CC] bg-secondary/10 px-5 py-3 text-[13px] font-semibold text-secondary">
          <Spinner className="h-4 w-4 text-secondary" />
          Re-scanning, about 20 seconds
        </div>
      )}

      <div className={cn("transition-opacity", rescanning && "pointer-events-none opacity-55")} aria-busy={rescanning}>
        <div className="flex items-center gap-4 p-4 sm:gap-6 sm:p-6">
          <ScoreRing score={score} toneClass={ringTone} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="ats-score-title" className="text-lg font-bold leading-tight tracking-[-0.01em] text-[#0C1A0E] sm:text-xl">
                {band.label}
              </h2>
              <StatusChip {...chip} />
            </div>
            <p className="text-sm leading-normal text-[#5F5954] sm:text-[15px]">
              {isEstimated ? "Estimated from your edits. Re-scan to verify." : band.description}
            </p>
            {projection && !isEstimated && (
              <p className={cn("flex items-start gap-2 text-[13px] font-semibold sm:text-sm", TONE_TEXT[projection.tone])}>
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {projection.text}
              </p>
            )}
          </div>
        </div>

        {isEstimated && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFE9DF] bg-secondary/10 px-4 py-3 sm:px-6">
            <span className="flex items-center gap-2 text-[13px] text-secondary">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              Estimated score, moved from {verifiedScore} since your last scan
            </span>
            <button
              type="button"
              onClick={onRescan}
              disabled={rescanning}
              className="h-11 shrink-0 rounded-[10px] bg-secondary px-3 text-[13px] font-semibold text-secondary-foreground hover:brightness-95 disabled:opacity-60 sm:h-9"
            >
              Re-scan
            </button>
          </div>
        )}

        {tiles && tiles.length > 0 && (
          <div className="grid grid-cols-3 gap-1 border-t border-[#EFE9DF] p-3 sm:gap-2 sm:px-5 sm:py-4">
            {tiles.map((t) => (
              <Tile key={t.key} tile={t} onClick={onTileClick ? () => onTileClick(t.key) : undefined} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
