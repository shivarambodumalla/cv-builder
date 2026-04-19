"use client";

import { Download } from "lucide-react";
import { AppPopover } from "./app-popover";

interface DownloadNudgeProps {
  score: number | null;
  downloadCount: number;
  onDownload: () => void;
}

export function DownloadNudge({ score, downloadCount, onDownload }: DownloadNudgeProps) {
  const hasScore = score != null && score > 0;
  const neverDownloaded = downloadCount === 0;

  return (
    <AppPopover
      id="download_nudge"
      title={`You scored ${score} but haven't downloaded`}
      subtitle="Take your improved CV with you before you go."
      ctaText="Download my CV"
      onAction={onDownload}
      cooldownDays={3}
      enabled={hasScore && neverDownloaded}
      icon={
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
          <Download className="h-3.5 w-3.5 text-white" />
        </div>
      }
    />
  );
}
