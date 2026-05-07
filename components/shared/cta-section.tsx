import Link from "next/link";

interface CtaSectionProps {
  label?: string;
  heading?: string;
  subtext?: string;
  buttonText?: string;
  buttonHref?: string;
  trustItems?: string[];
}

export function CtaSection({
  label = "Free analysis",
  heading = "Ready to see your ATS score?",
  subtext = "Under 60 seconds. No sign-up required.",
  buttonText = "Get started free",
  buttonHref = "/upload-resume",
  trustItems = ["Free to start", "No credit card", "Cancel anytime"],
}: CtaSectionProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-secondary via-primary to-primary p-8 sm:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
        {/* Left */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-accent mb-2.5">{label}</p>
          <h2 className="text-2xl sm:text-[28px] font-bold text-white leading-tight mb-2">{heading}</h2>
          <p className="text-sm text-white/70 mb-6">{subtext}</p>
          <Link
            href={buttonHref}
            className="inline-block rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-primary hover:bg-white/90 transition-colors mb-4"
          >
            {buttonText}
          </Link>
          <div className="flex flex-wrap gap-4">
            {trustItems.map((t) => (
              <span key={t} className="text-[11px] text-white/65">
                <span className="text-accent">&#10003;</span> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — score preview */}
        <div className="hidden lg:flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent bg-accent/10 mb-2.5">
            <div className="text-center">
              <span className="text-[28px] font-extrabold text-white leading-none">94</span>
              <span className="text-xs text-accent">%</span>
            </div>
          </div>
          <p className="text-[10px] text-accent mb-3">Sample ATS score</p>
          <div className="space-y-1.5 w-36">
            {[
              { label: "Keywords", pct: 92 },
              { label: "Bullets", pct: 88 },
              { label: "Sections", pct: 100 },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-2 rounded bg-white/10 px-3 py-1.5">
                <span className="text-[9px] text-white/60 w-14 shrink-0">{bar.label}</span>
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${bar.pct}%` }} />
                </div>
                <span className="text-[9px] text-white/60 w-7 text-right">{bar.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
