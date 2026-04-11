"use client";

import { Shield } from "lucide-react";

export function GuaranteeBadgeInline() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
      <Shield className="h-3 w-3" /> 80+ Score Guaranteed
    </span>
  );
}

export function GuaranteeBadgeFull() {
  return (
    <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
        <Shield className="h-6 w-6 text-success" />
      </div>
      <p className="text-base font-semibold text-foreground">80+ ATS Score Guarantee</p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
        If your score doesn&apos;t reach 80+ after using Fix All, we&apos;ll review your CV personally. Still not 80+? Full refund. No questions asked.
      </p>
    </div>
  );
}
