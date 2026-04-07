"use client";

import { BarChart3, Target, FileText } from "lucide-react";

const CONFIGS = {
  ats: {
    icon: <BarChart3 className="h-5 w-5 text-[#34D399]" />,
    label: "Free limit reached",
    heading: "Get your full ATS report",
    features: [
      "Score breakdown across 6 categories",
      "Missing keywords with one-click fix",
      "AI bullet rewrites to boost your score",
      "Detailed fix suggestions per issue",
    ],
  },
  job_match: {
    icon: <Target className="h-5 w-5 text-[#34D399]" />,
    label: "Free limit reached",
    heading: "Get your full match report",
    features: [
      "Detailed match score breakdown",
      "Missing keywords and skill gaps",
      "Fix mode with side-by-side editor",
      "AI rewrites to improve match score",
    ],
  },
  cover_letter: {
    icon: <FileText className="h-5 w-5 text-[#34D399]" />,
    label: "Free limit reached",
    heading: "Generate more cover letters",
    features: [
      "Unlimited cover letter generation",
      "3 tones: Professional, Conversational, Confident",
      "Tailored to every job you apply for",
      "Edit and export as PDF",
    ],
  },
};

interface Props {
  trigger: "ats" | "job_match" | "cover_letter";
  onUpgrade: () => void;
}

export function UpgradeBanner({ trigger, onUpgrade }: Props) {
  const config = CONFIGS[trigger];

  return (
    <div className="relative overflow-hidden rounded-[14px] bg-[#065F46] p-6 sm:p-7">
      {/* Decorative rings */}
      <svg className="absolute -top-5 -right-5 opacity-[0.08] pointer-events-none" width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" stroke="#34D399" strokeWidth="12" fill="none"/>
        <circle cx="60" cy="60" r="35" stroke="#34D399" strokeWidth="8" fill="none"/>
      </svg>

      {/* Header */}
      <div className="relative flex items-center gap-3.5 mb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#34D399]/20 border border-[#34D399]/35">
          {config.icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-[#34D399] tracking-[1.2px] uppercase mb-0.5">{config.label}</p>
          <h3 className="text-base font-bold text-[#ECFDF5] leading-tight">{config.heading}</h3>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#34D399]/20 mb-3.5" />

      {/* Features grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
        {config.features.map((f) => (
          <div key={f} className="flex items-center gap-1.5 py-1">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#34D399]/20">
              <span className="text-[9px] font-bold text-[#34D399]">&#10003;</span>
            </div>
            <span className="text-[11px] text-[#ECFDF5]">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onUpgrade}
        className="w-full rounded-lg bg-white py-2.5 text-[13px] font-bold text-[#065F46] hover:bg-white/90 transition-colors mb-2"
      >
        Upgrade to Pro
      </button>

      {/* Price row */}
      <div className="flex items-center justify-center gap-2">
        <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
        <span className="text-[11px] text-white/50">From $2.30/week</span>
        <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
        <span className="text-[11px] text-white/50">Cancel anytime</span>
        <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
      </div>
    </div>
  );
}
