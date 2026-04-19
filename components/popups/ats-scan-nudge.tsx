"use client";

interface AtsScanNudgeProps {
  hasScanned: boolean;
}

export function AtsScanNudge({ hasScanned }: AtsScanNudgeProps) {
  if (hasScanned) return null;

  return (
    <span className="relative flex h-2 w-2 ml-1" title="Run your free ATS scan">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
    </span>
  );
}
