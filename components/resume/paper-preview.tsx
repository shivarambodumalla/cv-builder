"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { PaperSize } from "@/lib/resume/types";
import { PAPER_DIMENSIONS } from "@/lib/resume/types";

const MM_TO_PX = 3.7795275591;
const IN_TO_PX = 96;

const PAGE_HEIGHTS: Record<PaperSize, number> = {
  a4: 297 * MM_TO_PX,
  letter: 279.4 * MM_TO_PX, // 11in exactly = 279.4mm → matches PDF viewport 1056px
};

interface PageBreak {
  offsetY: number;
  pageNum: number;
  isManual: boolean;
  sectionKey?: string;
  /** Horizontal extent of the column the break belongs to (unscaled px). */
  left: number;
  width: number;
  /** Only the first break for a page number carries the "Page N" label. */
  labelled: boolean;
}

/**
 * A unit Chromium will not split when printing. Mirrors the rules in
 * template-renderer.tsx: a section title (kept with what follows), an entry
 * header (kept with its first bullet), a single bullet, a bullet-less entry,
 * or a whole section without entries.
 */
interface Block {
  top: number;
  bottom: number;
  keepWithNext: boolean;
}

interface Column {
  centerX: number;
  left: number;
  width: number;
  sections: HTMLElement[];
}

interface PaperPreviewProps {
  paperSize: PaperSize;
  /** Top margin in inches the PDF adds on pages 2+. Page 1 relies on template padding. */
  topMarginIn?: number;
  manualBreaks?: string[];
  onRemoveManualBreak?: (key: string) => void;
  children: React.ReactNode;
}

export function PaperPreview({
  paperSize,
  topMarginIn = 0.5,
  manualBreaks = [],
  onRemoveManualBreak,
  children,
}: PaperPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [breaks, setBreaks] = useState<PageBreak[]>([]);

  const dims = PAPER_DIMENSIONS[paperSize];
  const widthPx = parseFloat(dims.width) * MM_TO_PX;
  const pageHeight = PAGE_HEIGHTS[paperSize];

  const computeBreaks = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const containerRect = el.getBoundingClientRect();
    const contentH = el.scrollHeight;

    if (contentH <= pageHeight) {
      setBreaks([]);
      return;
    }

    const topMarginPx = topMarginIn * IN_TO_PX;
    // The PDF gives page 1 no top margin (the template pads it) and pages 2+
    // a marginY top margin, so later pages hold less content.
    const usable = (page: number) => (page === 1 ? pageHeight : pageHeight - topMarginPx);

    const rel = (node: Element) => {
      const r = node.getBoundingClientRect();
      return { top: r.top - containerRect.top, bottom: r.bottom - containerRect.top };
    };

    // Group sections into columns by horizontal centre. Each column fragments
    // independently in print: a block pushed to the next page shifts only the
    // content below it in its own column.
    const columns: Column[] = [];
    el.querySelectorAll<HTMLElement>("[data-resume-section]").forEach((section) => {
      const r = section.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const centerX = r.left + r.width / 2 - containerRect.left;
      let col = columns.find((c) => Math.abs(c.centerX - centerX) < widthPx * 0.15);
      if (!col) {
        col = { centerX, left: r.left - containerRect.left, width: r.width, sections: [] };
        columns.push(col);
      }
      col.sections.push(section);
    });

    function blocksFor(section: HTMLElement): Block[] {
      const entries = Array.from(section.querySelectorAll<HTMLElement>("[data-resume-entry]"));
      if (entries.length === 0) return [{ ...rel(section), keepWithNext: false }];

      const blocks: Block[] = [];
      const title = section.querySelector<HTMLElement>("[data-resume-section-title]");
      if (title) blocks.push({ ...rel(title), keepWithNext: true });

      for (const entry of entries) {
        const bullets = Array.from(entry.querySelectorAll<HTMLElement>("li"));
        const er = rel(entry);
        if (bullets.length === 0) {
          blocks.push({ ...er, keepWithNext: false });
          continue;
        }
        // Header (role, company, dates) stays with the first bullet.
        blocks.push({ top: er.top, bottom: rel(bullets[0]).top, keepWithNext: true });
        bullets.forEach((li) => blocks.push({ ...rel(li), keepWithNext: false }));
      }
      return blocks;
    }

    const result: PageBreak[] = [];

    for (const col of columns) {
      let pageBottom = usable(1);
      let pageNum = 1;
      const push = (offsetY: number, isManual: boolean, sectionKey?: string) => {
        result.push({ offsetY, pageNum, isManual, sectionKey, left: col.left, width: col.width, labelled: false });
      };

      for (const section of col.sections) {
        const sectionKey = section.dataset.resumeSection || "";

        // Templates mark a forced break on the wrapper itself; the key match
        // covers templates that expose it, the attribute covers the rest.
        if (manualBreaks.includes(sectionKey) || section.hasAttribute("data-page-break-before")) {
          const sectionTop = rel(section).top;
          pageNum++;
          push(sectionTop, true, sectionKey);
          pageBottom = sectionTop + usable(pageNum);
        }

        const blocks = blocksFor(section);
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          if (block.bottom <= pageBottom) continue;

          // The block does not fit. Break before it, dragging along any
          // keep-with-next blocks immediately above it, unless the block is
          // taller than a fresh page, in which case print slices it anyway.
          let breakTop = block.top;
          for (let j = i - 1; j >= 0 && blocks[j].keepWithNext; j--) breakTop = blocks[j].top;
          if (block.bottom - block.top > usable(pageNum + 1)) breakTop = pageBottom;

          const breakY = Math.min(breakTop, pageBottom);
          pageNum++;
          push(breakY, false);
          pageBottom = breakY + usable(pageNum);

          while (block.bottom > pageBottom) {
            pageNum++;
            push(pageBottom, false);
            pageBottom += usable(pageNum);
          }
        }
      }
    }

    // Label the first (topmost) break per page number; other columns' breaks
    // for the same page draw only the dashed line.
    result.sort((a, b) => a.pageNum - b.pageNum || a.offsetY - b.offsetY);
    const seen = new Set<number>();
    for (const b of result) {
      if (!seen.has(b.pageNum)) {
        b.labelled = true;
        seen.add(b.pageNum);
      }
    }

    setBreaks(result);
  }, [pageHeight, widthPx, topMarginIn, manualBreaks]);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth;
      setScale(Math.min(availableWidth / widthPx, 1));
    }

    updateScale();
    const ro = new ResizeObserver(() => {
      updateScale();
      computeBreaks();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [widthPx, computeBreaks]);

  useEffect(() => {
    const timer = setTimeout(computeBreaks, 100);
    return () => clearTimeout(timer);
  }, [children, computeBreaks]);

  const totalPages = breaks.reduce((max, b) => Math.max(max, b.pageNum), 1);
  const contentHeight = contentRef.current?.scrollHeight ?? pageHeight;
  const displayHeight = Math.max(contentHeight, pageHeight * totalPages);

  const rawHeight = Math.max(displayHeight, pageHeight);
  const scaledWidth = widthPx * scale;
  const scaledHeight = rawHeight * scale;

  return (
    <div ref={containerRef} className="w-full flex justify-center pb-4">
      <div style={{ width: scaledWidth, height: scaledHeight }}>
        <div
          style={{
            width: widthPx,
            minHeight: rawHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="relative"
        >
        <div
          ref={contentRef}
          className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] rounded-sm"
          style={{ minHeight: pageHeight }}
        >
          {children}
        </div>

        {breaks.map((b, i) => {
          const showLabel = b.labelled || b.isManual;
          const lineClass = `flex-1 border-t-2 border-dashed ${
            b.isManual ? "border-blue-400" : "border-muted-foreground/20"
          }`;
          return (
            <div
              key={i}
              className="absolute pointer-events-auto"
              style={{ top: b.offsetY, left: b.left, width: b.width, zIndex: 10 }}
            >
              <div className="relative flex items-center py-2">
                <div className={lineClass} />
                {showLabel && (
                  <span
                    className={`mx-3 shrink-0 rounded-full px-3 py-0.5 text-[10px] font-medium ${
                      b.isManual
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.isManual ? "Manual break" : `Page ${b.pageNum}`}
                    {b.isManual && b.sectionKey && onRemoveManualBreak && (
                      <button
                        className="ml-1.5 inline-flex items-center text-blue-400 hover:text-blue-600"
                        onClick={() => onRemoveManualBreak(b.sectionKey!)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                )}
                {showLabel && <div className={lineClass} />}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
