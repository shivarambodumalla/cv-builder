"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CP_CARD } from "./path-meta";

// The wait is about 20 seconds, so the loader shows the work: the current role
// in the middle, three branches drawing out to result cards that fill in, a
// status line that rotates through the real steps, a progress bar and a timer.
// Every animation is CSS or SMIL and stops under prefers-reduced-motion.

export type LoaderStep = "reading" | "finding" | "checking";

const STATUS_LINES: Record<LoaderStep, string[]> = {
  reading: [
    "Reading your titles and tools",
    "Working out your years in each job",
    "Noting the results you list",
  ],
  finding: [
    "Listing roles next to yours",
    "Weighing step ups, sideways moves and career changes",
    "Checking which of your skills carry over",
    "Ranking the roles by fit",
  ],
  checking: [
    "Counting open jobs in the US",
    "Reading advertised pay ranges",
    "Keeping pay only where 5 or more ads list it",
    "Putting your results together",
  ],
};

const STEP_TITLES: Record<LoaderStep, string> = {
  reading: "Reading your resume",
  finding: "Finding your next roles",
  checking: "Checking live job ads",
};

const ROTATE_MS = 2600;
const EXPECTED_SECONDS = 20;

// Three branches from the role to three result slots, drawn left to right.
const BRANCHES = [
  { d: "M106 100 C 250 100, 250 40, 396 40", y: 40, delay: 0.2 },
  { d: "M106 100 C 250 100, 250 100, 396 100", y: 100, delay: 0.7 },
  { d: "M106 100 C 250 100, 250 160, 396 160", y: 160, delay: 1.2 },
];

/** Up to two lines of at most `max` characters, split on words; a long tail is cut with an ellipsis. */
function wrapLabel(text: string, max = 12): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= max) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
      if (lines.length === 2) break;
    }
  }
  if (lines.length < 2 && cur) lines.push(cur);
  return lines
    .slice(0, 2)
    .map((l) => (l.length > max ? l.slice(0, max - 1) + "…" : l));
}

const STYLES = `
@keyframes cp-draw { to { stroke-dashoffset: 0; } }
@keyframes cp-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes cp-pulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
@keyframes cp-ring { from { r: 34; opacity: 0.5; } to { r: 62; opacity: 0; } }
@keyframes cp-progress { from { width: 4%; } to { width: 92%; } }
.cp-draw { stroke-dasharray: 380; stroke-dashoffset: 380; animation: cp-draw 1.3s cubic-bezier(.3,.7,.3,1) forwards; }
.cp-fade { animation: cp-fade 0.4s ease-out; }
.cp-pulse { animation: cp-pulse 1.6s ease-in-out infinite; }
.cp-ring { animation: cp-ring 2.4s ease-out infinite; }
.cp-progress { animation: cp-progress ${EXPECTED_SECONDS + 4}s cubic-bezier(.2,.7,.3,1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .cp-draw { stroke-dashoffset: 0; animation: none; }
  .cp-fade, .cp-pulse, .cp-ring { animation: none; }
  .cp-ring { opacity: 0; }
  .cp-progress { animation: none; width: 50%; }
  .cp-motion { display: none; }
}
`;

function useTicker(active: boolean, ms: number): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    setN(0);
    const t = setInterval(() => setN((v) => v + 1), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return n;
}

export function CareerPathLoader({
  steps,
  step,
  roleLabel,
  className,
}: {
  /** The steps this run goes through, in order (resume runs start with "reading"). */
  steps: LoaderStep[];
  step: LoaderStep;
  /** What sits in the middle of the map: the typed role, or "Your resume". */
  roleLabel: string;
  className?: string;
}) {
  const tick = useTicker(true, ROTATE_MS);
  const lines = STATUS_LINES[step];
  const line = lines[tick % lines.length];
  const centreLines = wrapLabel(
    roleLabel.trim().length > 0 ? roleLabel.trim() : "Your role",
  );

  return (
    <div
      className={cn(CP_CARD, "overflow-hidden p-6 sm:p-7", className)}
      aria-busy="true"
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {/* What is happening */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-cp-display text-[28px] leading-tight">
            {STEP_TITLES[step]}
          </p>
          <p
            key={line}
            className="cp-fade mt-1.5 min-h-[1.5em] text-sm text-[#4A443E]"
          >
            {line}
            <span className="text-[#A8A097]">…</span>
          </p>
        </div>

        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EDE8DF]">
            <div className="cp-progress h-full rounded-full bg-[#065F46]" />
          </div>
          <p className="mt-2 text-xs text-[#5F5852]">Keep this tab open.</p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5F5852]">
          {steps.map((s) => {
            const done = steps.indexOf(s) < steps.indexOf(step);
            const active = s === step;
            return (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-1.5",
                  active && "font-semibold text-[#0C1A0E]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    done || active ? "bg-[#065F46]" : "border border-[#A8A097]",
                    active && "cp-pulse",
                  )}
                  aria-hidden="true"
                />
                {STEP_TITLES[s]}
                {done && <span className="sr-only"> (done)</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* The map drawing itself */}
      <svg
        viewBox="0 0 520 200"
        className="mt-6 w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* userSpaceOnUse: the middle branch is a straight line whose bounding box has no
                height, and a bounding-box gradient makes its stroke vanish. */}
          <linearGradient
            id="cp-branch"
            gradientUnits="userSpaceOnUse"
            x1="106"
            y1="0"
            x2="396"
            y2="0"
          >
            <stop offset="0" stopColor="#065F46" />
            <stop offset="1" stopColor="#8FD3B5" />
          </linearGradient>
        </defs>

        {/* Result slots (skeleton cards) */}
        {BRANCHES.map((b, i) => (
          <g
            key={b.y}
            className="cp-pulse"
            style={{ animationDelay: `${i * 0.35}s` }}
          >
            <rect
              x="408"
              y={b.y - 22}
              width="104"
              height="44"
              rx="8"
              fill="#FFFFFF"
              stroke="#E0D8CC"
            />
            <rect
              x="418"
              y={b.y - 12}
              width="52"
              height="6"
              rx="3"
              fill="#EDE8DF"
            />
            <rect
              x="418"
              y={b.y - 1}
              width="78"
              height="5"
              rx="2.5"
              fill="#F0EDE6"
            />
            <rect
              x="418"
              y={b.y + 8}
              width="40"
              height="5"
              rx="2.5"
              fill="#F0EDE6"
            />
            <rect
              x="482"
              y={b.y - 13}
              width="20"
              height="8"
              rx="4"
              fill="#E6F2EC"
            />
          </g>
        ))}

        {/* Branches */}
        {BRANCHES.map((b) => (
          <g key={b.d}>
            <path
              d={b.d}
              fill="none"
              stroke="url(#cp-branch)"
              strokeWidth="2"
              strokeLinecap="round"
              className="cp-draw"
              style={{ animationDelay: `${b.delay}s` }}
            />
            <circle r="3.5" fill="#065F46" className="cp-motion">
              <animateMotion
                dur="2.6s"
                begin={`${b.delay + 1.2}s`}
                repeatCount="indefinite"
                path={b.d}
              />
            </circle>
            <circle
              cx="396"
              cy={b.y}
              r="4"
              fill="#FFFFFF"
              stroke="#065F46"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* The current role */}
        <circle
          cx="70"
          cy="100"
          r="34"
          fill="none"
          stroke="#065F46"
          strokeWidth="1.5"
          className="cp-ring"
        />
        <circle cx="70" cy="100" r="34" fill="#065F46" />
        <text
          x="70"
          y="100"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#F7F5F0"
          fontSize="11"
          fontWeight="600"
          fontFamily="inherit"
        >
          {centreLines.length === 1
            ? centreLines[0]
            : centreLines.map((l, i) => (
                <tspan key={l} x="70" dy={i === 0 ? "-6" : "12"}>
                  {l}
                </tspan>
              ))}
        </text>
      </svg>
    </div>
  );
}
