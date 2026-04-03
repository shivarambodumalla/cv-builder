"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { PaperSize } from "@/lib/resume/types";
import { PAPER_DIMENSIONS } from "@/lib/resume/types";

const MM_TO_PX = 3.7795275591;

const PAGE_HEIGHTS: Record<PaperSize, number> = {
  a4: 297 * MM_TO_PX,
  letter: 279 * MM_TO_PX,
};

interface PageBreak {
  offsetY: number;
  pageNum: number;
  isManual: boolean;
  sectionKey?: string;
}

interface PaperPreviewProps {
  paperSize: PaperSize;
  manualBreaks?: string[];
  onRemoveManualBreak?: (key: string) => void;
  children: React.ReactNode;
}

export function PaperPreview({
  paperSize,
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

    const sections = el.querySelectorAll<HTMLElement>("[data-resume-section]");
    const result: PageBreak[] = [];
    let currentPageBottom = pageHeight;
    let pageNum = 1;

    sections.forEach((section) => {
      const sectionKey = section.dataset.resumeSection || "";
      const sectionTop = section.offsetTop;

      if (manualBreaks.includes(sectionKey) && pageNum >= 1) {
        pageNum++;
        result.push({
          offsetY: sectionTop,
          pageNum,
          isManual: true,
          sectionKey,
        });
        currentPageBottom = sectionTop + pageHeight;
        return;
      }

      const entries = section.querySelectorAll<HTMLElement>("[data-resume-entry]");
      const elements = entries.length > 0 ? Array.from(entries) : [section];

      elements.forEach((item) => {
        const itemTop = item.offsetTop;
        const itemBottom = itemTop + item.offsetHeight;

        if (itemBottom > currentPageBottom) {
          pageNum++;
          const breakY = itemTop > currentPageBottom ? currentPageBottom : itemTop;
          result.push({
            offsetY: breakY,
            pageNum,
            isManual: false,
          });
          currentPageBottom = breakY + pageHeight;
        }
      });
    });

    setBreaks(result);
  }, [pageHeight, manualBreaks]);

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

  const totalPages = breaks.length > 0 ? breaks[breaks.length - 1].pageNum : 1;
  const contentHeight = contentRef.current?.scrollHeight ?? pageHeight;
  const displayHeight = Math.max(contentHeight, pageHeight * totalPages);

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          width: widthPx,
          minHeight: pageHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginBottom: `${displayHeight * scale - displayHeight}px`,
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

        {breaks.map((b, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 pointer-events-auto"
            style={{ top: b.offsetY * scale, zIndex: 10 }}
          >
            <div className="relative flex items-center py-2">
              <div
                className={`flex-1 border-t-2 border-dashed ${
                  b.isManual ? "border-blue-400" : "border-muted-foreground/20"
                }`}
              />
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
              <div
                className={`flex-1 border-t-2 border-dashed ${
                  b.isManual ? "border-blue-400" : "border-muted-foreground/20"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
