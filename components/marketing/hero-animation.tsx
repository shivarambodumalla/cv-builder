"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_ACCENTS, HERO_TOUR, heroAccentSrc, heroTourSrc } from "@/lib/resume/template-thumbnails";
import { TEMPLATE_LABELS } from "@/lib/resume/template-labels";

/**
 * Homepage hero: a four-step tour of the editor on one resume (the Orchid
 * persona, Rachel Brooks). ATS scan → Fix with AI → Edit content → Change
 * design. Steps auto-advance and loop; the tabs jump to a step. The art is a
 * fixed 560×420 stage scaled to the column; the tabs sit outside it so their
 * labels stay readable on phones.
 */

const STAGE_W = 560;
const STAGE_H = 420;

// `short` labels fit four tabs across a phone.
const SCENES = [
  { label: "ATS scan", short: "Scan", ms: 4800 },
  { label: "Fix with AI", short: "Fix", ms: 5200 },
  { label: "Edit content", short: "Edit", ms: 4200 },
  { label: "Change design", short: "Design", ms: 10800 },
] as const;

const ACCENT_NAMES: Record<(typeof HERO_ACCENTS)[number], string> = {
  "#7E22CE": "Violet",
  "#DC2626": "Crimson",
  "#C2410C": "Rust",
  "#0F766E": "Teal",
  "#9F1239": "Burgundy",
  "#B45309": "Cognac",
  "#065F46": "Emerald",
};

// Every card the resume can show: the tour templates, then Orchid in each accent.
const CARDS = [...HERO_TOUR.map((t) => heroTourSrc(t.template)), ...HERO_ACCENTS.map(heroAccentSrc)];

const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=640&q=80`;

// Demo scores: "Needs Improvement" before the fixes, "Strong Profile" after (ATS thresholds 60 / 75).
const SCORE_BEFORE = 61;
const SCORE_AFTER = 79;

// Issue bands sit on real lines of the Orchid render (stage px):
// 1 = "Serve on the sepsis committee…", 2 = the Skills block, 3 = "Provided care for 5–6 patients…".
const ISSUES = [
  { box: [136, 110, 182, 20], tone: "warn", title: "Weak opening verb", detail: "“Serve on” says little" },
  { box: [34, 144, 96, 62], tone: "bad", title: "3 missing keywords", detail: "Found in similar job posts" },
  { box: [136, 216, 182, 20], tone: "warn", title: "Bullet has no result", detail: "Add a real number" },
] as const;

const TONE = {
  warn: { solid: "var(--tour-warn)", tint: "color-mix(in srgb, var(--warning) 14%, transparent)", edge: "color-mix(in srgb, var(--warning) 55%, transparent)" },
  bad: { solid: "var(--tour-bad)", tint: "color-mix(in srgb, var(--error) 10%, transparent)", edge: "color-mix(in srgb, var(--error) 50%, transparent)" },
  ok: { solid: "var(--tour-ok)", tint: "color-mix(in srgb, var(--success) 12%, transparent)", edge: "color-mix(in srgb, var(--success) 50%, transparent)" },
} as const;

const CURSOR_HOME = { cx: 500, cy: 440 };
// Thumbnails sit in a 5 x 2 grid (30 x 40px cells, 5px gaps) inside the 170px-wide panel; the swatch row follows it.
const thumbAt = (i: number) => ({ cx: 364 + (i % 5) * 35 + 13, cy: 158 + Math.floor(i / 5) * 46 + 17 });
const swatchAt = (j: number) => ({ cx: 364 + j * 25.3 + 4, cy: 282 });

type Tour = {
  beam: boolean;
  shown: number;
  fixed: boolean;
  score: number | null;
  delta: boolean;
  pressed: boolean;
  typed: string | null;
  typing: boolean;
  saved: boolean;
  tpl: number;
  color: number;
  prev: number;
  bump: boolean;
  cursor: boolean;
  cx: number;
  cy: number;
  fade: boolean;
};

const cardIndex = (s: Tour) => (s.color >= 0 ? HERO_TOUR.length + s.color : s.tpl);

/** State at the start of a step: everything earlier steps did is already done. */
function startOf(scene: number): Tour {
  const s: Tour = {
    beam: false, shown: 0, fixed: false, score: null, delta: false, pressed: false,
    typed: null, typing: false, saved: false, tpl: 0, color: -1, prev: -1, bump: false,
    cursor: false, ...CURSOR_HOME, fade: false,
  };
  if (scene >= 1) Object.assign(s, { shown: 3, score: SCORE_BEFORE });
  if (scene >= 2) Object.assign(s, { shown: 0, fixed: true, score: SCORE_AFTER, delta: true });
  if (scene >= 3) Object.assign(s, { typed: "31" });
  return s;
}

/** Final frame of a step, shown on its own when the visitor prefers reduced motion. */
function endOf(scene: number): Tour {
  if (scene === 0) return { ...startOf(0), shown: 3, score: SCORE_BEFORE };
  if (scene === 1) return { ...startOf(1), fixed: true, score: SCORE_AFTER, delta: true };
  if (scene === 2) return { ...startOf(2), typed: "31", saved: true };
  return { ...startOf(3), tpl: 2 };
}

function scoreLabel(score: number | null) {
  if (score === null) return { text: "Scanning your resume", color: "var(--muted-foreground)", ring: "var(--primary)" };
  if (score >= 75) return { text: "Strong Profile", color: "var(--tour-ok)", ring: "var(--success)" };
  if (score >= 60) return { text: "Needs Improvement", color: "var(--tour-warn)", ring: "var(--warning)" };
  return { text: "Checking 6 categories", color: "var(--muted-foreground)", ring: "var(--error)" };
}

export function HeroAnimation({ templateCount, allTemplatesFree }: { templateCount: number; allTemplatesFree: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scene, setScene] = useState(0);
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [designLoaded, setDesignLoaded] = useState(false);
  const [s, setS] = useState<Tour>(() => startOf(0));

  const go = (next: number) => {
    setScene(next);
    setRun((r) => r + 1);
  };

  // Fit the fixed stage to the column; pause while the hero is off screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const resize = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / STAGE_W)));
    const seen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    resize.observe(root);
    seen.observe(root);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);
    return () => {
      resize.disconnect();
      seen.disconnect();
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  // The design step's 17 images (10 templates, 7 accents) load one step early, not with the page.
  useEffect(() => {
    if (scene >= 2) setDesignLoaded(true);
  }, [scene]);

  useEffect(() => {
    if (reduced) {
      setS(endOf(scene));
      return;
    }
    if (!visible) return;
    setS(startOf(scene));

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const patch = (p: Partial<Tour>) => setS((prev) => ({ ...prev, ...p }));
    const countTo = (from: number, to: number, ms: number) => {
      const steps = Math.max(1, Math.round(ms / 30));
      for (let i = 1; i <= steps; i++) at((ms / steps) * i, () => patch({ score: Math.round(from + ((to - from) * i) / steps) }));
    };
    const pick = (tpl: number, color: number) => {
      setS((prev) => ({ ...prev, prev: cardIndex(prev), tpl, color, bump: true }));
      at(260, () => patch({ bump: false }));
    };

    if (scene === 0) {
      at(200, () => patch({ beam: true }));
      at(2000, () => {
        patch({ shown: 1 });
        countTo(0, SCORE_BEFORE, 700);
      });
      at(2400, () => patch({ shown: 2 }));
      at(2800, () => patch({ shown: 3 }));
    } else if (scene === 1) {
      at(300, () => patch({ cursor: true }));
      at(400, () => patch({ cx: 462, cy: 352 }));
      at(1400, () => patch({ pressed: true }));
      at(1600, () => {
        patch({ pressed: false, fixed: true });
        countTo(SCORE_BEFORE, SCORE_AFTER, 1200);
      });
      at(3000, () => patch({ delta: true, cursor: false }));
    } else if (scene === 2) {
      at(300, () => patch({ cursor: true }));
      at(400, () => patch({ cx: 470, cy: 212 }));
      at(1200, () => patch({ typing: true, typed: "" }));
      at(1550, () => patch({ typed: "3" }));
      at(1800, () => patch({ typed: "31" }));
      at(2300, () => patch({ typing: false, saved: true, cursor: false }));
    } else {
      const step = 620;
      at(200, () => patch({ cursor: true, ...thumbAt(1) }));
      for (let i = 1; i < HERO_TOUR.length; i++) {
        at(300 + (i - 1) * step, () => patch(thumbAt(i)));
        at(600 + (i - 1) * step, () => pick(i, -1));
      }
      const colorsAt = 300 + HERO_TOUR.length * step;
      at(colorsAt - 300, () => patch(thumbAt(0)));
      at(colorsAt, () => pick(0, -1));
      HERO_ACCENTS.forEach((_, j) => {
        at(colorsAt + 200 + j * 500, () => patch(swatchAt(j)));
        at(colorsAt + 420 + j * 500, () => pick(0, j));
      });
      at(SCENES[3].ms - 400, () => patch({ cursor: false }));
    }

    at(SCENES[scene].ms, () => {
      if (scene < SCENES.length - 1) return go(scene + 1);
      patch({ fade: true });
      at(600, () => go(0));
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [scene, run, visible, reduced]);

  const label = scoreLabel(s.score);
  const current = cardIndex(s);
  const designName =
    TEMPLATE_LABELS[HERO_TOUR[s.tpl].template] + (s.color >= 0 ? ` · ${ACCENT_NAMES[HERO_ACCENTS[s.color]]}` : "");
  const slotTone = s.typed === null ? TONE.warn : s.typing ? null : TONE.ok;

  return (
    <div className="hero-tour">
      <div className="tabs" role="group" aria-label="Product tour">
        {SCENES.map((sc, i) => (
          <button key={sc.label} type="button" className="tab" aria-pressed={i === scene} onClick={() => go(i)}>
            <span className={i === scene ? "tab-label on" : "tab-label"}>
              <span className="long">{sc.label}</span>
              <span className="short">{sc.short}</span>
            </span>
            <span className="track">
              {i === scene && !reduced ? (
                <span
                  key={`${scene}-${run}`}
                  className="bar run"
                  style={{ animationDuration: `${sc.ms}ms`, animationPlayState: visible ? "running" : "paused" }}
                />
              ) : (
                <span className={i < scene || (i === scene && reduced) ? "bar done" : "bar"} />
              )}
            </span>
          </button>
        ))}
      </div>

      <div ref={rootRef} className="frame" aria-hidden="true">
        <div className={s.fade ? "stage fade" : "stage"} style={{ transform: `scale(${scale})` }}>
          <div className={scene === 3 ? "glow on" : "glow"} style={{ backgroundColor: s.color >= 0 ? HERO_ACCENTS[s.color] : "var(--primary)" }} />

          <div className={s.bump ? "card bump" : "card"}>
            {CARDS.map((src, i) =>
              i === 0 || designLoaded ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={optimised(src)} alt="" className={i === current ? "page on" : i === s.prev ? "page out" : "page"} />
              ) : null
            )}
            <div className={s.beam ? "beam on" : "beam"} />
          </div>

          {ISSUES.map((issue, i) => {
            const tone = TONE[s.fixed ? "ok" : issue.tone];
            const [x, y, w, h] = issue.box;
            const shown = s.shown > i ? " show" : "";
            return (
              <div key={issue.title}>
                <div
                  className={`band${shown}`}
                  style={{ left: x, top: y, width: w, height: h, backgroundColor: tone.tint, boxShadow: `inset 0 0 0 1.5px ${tone.edge}` }}
                />
                <div className={`num${shown}`} style={{ left: x + w - 9, top: y - 9, backgroundColor: tone.solid }}>
                  {i + 1}
                </div>
              </div>
            );
          })}

          <div className="chips">
            {ISSUES.map((issue, i) => (
              <div key={issue.title} className={scene === 0 && s.shown > i ? "chip show" : "chip"}>
                <div className="chip-head">
                  <span className="chip-num" style={{ backgroundColor: TONE[issue.tone].solid }}>{i + 1}</span>
                  <span style={{ color: TONE[issue.tone].solid }}>{issue.title}</span>
                </div>
                <div className="chip-detail">{issue.detail}</div>
              </div>
            ))}
          </div>

          <div className="score">
            <div className="score-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" fill="none" stroke="var(--border)" strokeWidth="6" />
                <circle
                  cx="30" cy="30" r="25" fill="none" stroke={label.ring} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="157.08" strokeDashoffset={157.08 * (1 - (s.score ?? 0) / 100)}
                  transform="rotate(-90 30 30)" style={{ transition: "stroke .4s ease" }}
                />
              </svg>
              <span className="ring-num">{s.score ?? "–"}</span>
            </div>
            <div className="score-text">
              <span className="eyebrow">ATS score</span>
              <span className="score-label" style={{ color: label.color }}>{label.text}</span>
            </div>
            <span className={s.delta ? "delta show" : "delta"}>+{SCORE_AFTER - SCORE_BEFORE}</span>
          </div>

          <div className={scene === 1 ? "panel on" : "panel"} style={{ padding: 12 }}>
            <div className="panel-head">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
              </svg>
              Fix with AI
              <span className="pill">3 fixes</span>
            </div>
            <div className="modes">
              <span>ATS</span>
              <span className="on">Impact</span>
              <span>Concise</span>
            </div>
            <div className="eyebrow" style={{ marginTop: 10 }}>Before</div>
            <div className="before">Helped make the triage process faster</div>
            <div className="eyebrow" style={{ marginTop: 8, color: "var(--primary)" }}>After</div>
            <div className="after">
              Led a triage redesign that cut door-to-provider time by <span className="slot" style={{ background: TONE.warn.tint, color: TONE.warn.solid }}>[X]</span>%
            </div>
            <div className={s.pressed ? "apply pressed" : "apply"} style={{ background: s.fixed ? "var(--tour-ok)" : "var(--primary)" }}>
              {s.fixed ? "✓ Applied" : "Apply all fixes"}
            </div>
          </div>

          <div className={scene === 2 ? "panel on" : "panel"} style={{ overflow: "hidden" }}>
            <div className="editor-tabs">
              <span className="on">Content</span>
              <span>Design</span>
              <span>ATS</span>
            </div>
            <div style={{ padding: 12 }}>
              <div className="field-label">Experience · Charge Nurse</div>
              <div className={s.typing ? "field focused" : "field"}>
                Led a triage redesign that cut door-to-provider time by{" "}
                <span
                  className="slot"
                  style={slotTone ? { background: slotTone.tint, color: slotTone.solid } : { background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
                >
                  {s.typed ?? "[X]"}
                  {s.typing && <span className="caret" />}
                </span>
                %
              </div>
              <div className="hint">AI never invents numbers. Add your real one.</div>
              <div className={s.saved ? "saved show" : "saved"}>
                <span className="saved-dot" />
                Changes saved
              </div>
            </div>
          </div>

          <div className={scene === 3 ? "panel on" : "panel"} style={{ padding: 12 }}>
            <div className="eyebrow">Templates</div>
            <div className="thumbs">
              {HERO_TOUR.map((t, i) => (
                <div key={t.template} className={i === s.tpl ? "thumb sel" : "thumb"}>
                  {designLoaded && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={optimised(heroTourSrc(t.template))} alt="" />
                  )}
                </div>
              ))}
            </div>
            <div className="eyebrow" style={{ marginTop: 12 }}>Accent color</div>
            <div className="swatches">
              {HERO_ACCENTS.map((hex, j) => (
                <span key={hex} className={j === s.color ? "swatch sel" : "swatch"} style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="design-name">{designName}</div>
            <div className="design-sub">{allTemplatesFree ? `${templateCount} templates, all free` : `${templateCount} templates`}</div>
          </div>

          <div className={s.cursor ? "cursor show" : "cursor"} style={{ left: s.cx, top: s.cy }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="var(--foreground)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-tour {
          --tour-ok: color-mix(in srgb, var(--success) 80%, #000);
          --tour-warn: color-mix(in srgb, var(--warning) 75%, #000);
          --tour-bad: color-mix(in srgb, var(--error) 85%, #000);
          --tour-shadow: 0 12px 32px rgba(45, 58, 46, 0.14);
          width: 100%;
        }
        .tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          padding: 0 8px 0 4.3%;
          margin-bottom: 6px;
        }
        .tab {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
          min-height: 44px;
          padding: 0;
          border: 0;
          background: none;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }
        .tab:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 3px;
          border-radius: 4px;
        }
        .tab-label {
          font-size: 12px;
          font-weight: 600;
          line-height: 1.2;
          color: var(--muted-foreground);
          transition: color 0.3s ease;
        }
        .tab-label.on {
          color: var(--primary);
        }
        .long {
          display: none;
        }
        @media (min-width: 640px) {
          .tab-label {
            font-size: 13px;
          }
          .long {
            display: inline;
          }
          .short {
            display: none;
          }
        }
        .track {
          display: block;
          height: 3px;
          border-radius: 3px;
          background: var(--border);
          overflow: hidden;
        }
        .bar {
          display: block;
          height: 100%;
          background: var(--primary);
          transform: scaleX(0);
          transform-origin: left;
        }
        .bar.done {
          transform: scaleX(1);
          opacity: 0.45;
        }
        .bar.run {
          animation-name: fill;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes fill {
          to {
            transform: scaleX(1);
          }
        }

        .frame {
          position: relative;
          width: 100%;
          aspect-ratio: ${STAGE_W} / ${STAGE_H};
          background-image: radial-gradient(color-mix(in srgb, var(--primary) 10%, transparent) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .stage {
          position: absolute;
          left: 0;
          top: 0;
          width: ${STAGE_W}px;
          height: ${STAGE_H}px;
          transform-origin: top left;
          transition: opacity 0.5s ease;
        }
        .stage.fade {
          opacity: 0;
        }

        .glow {
          position: absolute;
          left: -36px;
          top: -26px;
          width: 420px;
          height: 460px;
          border-radius: 50%;
          filter: blur(56px);
          opacity: 0;
          transition: opacity 0.6s ease, background-color 0.5s ease;
        }
        .glow.on {
          opacity: 0.45;
        }
        .card {
          position: absolute;
          left: 24px;
          top: 10px;
          width: 300px;
          height: 388px;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 24px 56px rgba(45, 58, 46, 0.18), 0 4px 14px rgba(45, 58, 46, 0.08);
          transition: transform 0.5s cubic-bezier(0.2, 0.9, 0.25, 1.2);
        }
        .card.bump {
          transform: scale(1.04) rotate(-1deg);
        }
        .page {
          position: absolute;
          left: 0;
          top: 0;
          width: 300px;
          opacity: 0;
          transform: translateX(46px) rotate(4deg) scale(0.94);
          transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1.15);
        }
        .page.on {
          opacity: 1;
          transform: none;
        }
        .page.out {
          transform: translateX(-46px) rotate(-4deg) scale(0.94);
        }
        .beam {
          position: absolute;
          left: 0;
          right: 0;
          top: -70px;
          height: 70px;
          opacity: 0;
          background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--primary) 16%, transparent));
          border-bottom: 2px solid var(--primary);
          box-shadow: 0 8px 18px -6px color-mix(in srgb, var(--primary) 45%, transparent);
        }
        .beam.on {
          animation: sweep 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
        @keyframes sweep {
          0% {
            top: -70px;
            opacity: 0;
          }
          8%,
          92% {
            opacity: 1;
          }
          100% {
            top: 388px;
            opacity: 0;
          }
        }

        .band {
          position: absolute;
          border-radius: 4px;
          opacity: 0;
          transform: scaleX(0.2);
          transform-origin: left;
          transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.4s ease, box-shadow 0.4s ease;
        }
        .band.show {
          opacity: 1;
          transform: none;
        }
        .num,
        .chip-num {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
        }
        .num {
          position: absolute;
          opacity: 0;
          transform: scale(0.4);
          transition: opacity 0.3s ease 0.15s, transform 0.4s cubic-bezier(0.2, 0.9, 0.25, 1.3) 0.15s, background-color 0.4s ease;
        }
        .num.show {
          opacity: 1;
          transform: none;
        }
        .num::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: 50%;
          background: inherit;
          animation: pulse 1.4s ease-out infinite;
        }
        @keyframes pulse {
          from {
            transform: scale(1);
            opacity: 0.55;
          }
          to {
            transform: scale(2.6);
            opacity: 0;
          }
        }

        .chips {
          position: absolute;
          left: 352px;
          top: 120px;
          width: 196px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chip {
          padding: 9px 12px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
          box-shadow: var(--tour-shadow);
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .chip.show {
          opacity: 1;
          transform: none;
        }
        .chip-head {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
        }
        .chip-detail {
          margin-top: 3px;
          padding-left: 25px;
          font-size: 12px;
          color: var(--muted-foreground);
        }

        .score {
          position: absolute;
          left: 352px;
          top: 14px;
          width: 196px;
          height: 92px;
          box-sizing: border-box;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
          box-shadow: var(--tour-shadow);
        }
        .score-ring {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }
        .ring-num {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--foreground);
        }
        .score-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .score-label {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.25;
        }
        .eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted-foreground);
        }
        .delta {
          position: absolute;
          top: -10px;
          right: -8px;
          padding: 3px 8px;
          border-radius: 999px;
          background: var(--tour-ok);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          opacity: 0;
        }
        .delta.show {
          animation: pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes pop {
          0% {
            transform: translateY(6px) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(-2px) scale(1.06);
            opacity: 1;
          }
          100% {
            transform: none;
            opacity: 1;
          }
        }

        .panel {
          position: absolute;
          left: 352px;
          top: 124px;
          width: 196px;
          box-sizing: border-box;
          border-radius: 12px;
          background: #fff;
          border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
          box-shadow: var(--tour-shadow);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .panel.on {
          opacity: 1;
          transform: none;
        }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--foreground);
        }
        .pill {
          margin-left: auto;
          padding: 2px 7px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          color: var(--primary);
          font-size: 11px;
          font-weight: 600;
        }
        .modes {
          display: flex;
          gap: 4px;
          margin-top: 9px;
        }
        .modes span {
          padding: 2px 7px;
          border-radius: 999px;
          border: 1px solid var(--border);
          font-size: 10.5px;
          color: var(--muted-foreground);
        }
        .modes span.on {
          border-color: transparent;
          background: var(--primary);
          color: #fff;
          font-weight: 600;
        }
        .before {
          margin-top: 2px;
          font-size: 12px;
          line-height: 1.45;
          color: var(--muted-foreground);
          text-decoration: line-through;
        }
        .after {
          margin-top: 2px;
          font-size: 12px;
          line-height: 1.45;
          color: var(--foreground);
        }
        .slot {
          padding: 0 2px;
          border-radius: 4px;
          font-weight: 600;
        }
        .apply {
          margin-top: 12px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.3s ease;
        }
        .apply.pressed {
          transform: scale(0.95);
          box-shadow: 0 0 0 6px color-mix(in srgb, var(--primary) 18%, transparent);
        }

        .editor-tabs {
          display: flex;
          gap: 12px;
          padding: 9px 12px 0;
          background: var(--background);
          border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
          font-size: 11.5px;
          font-weight: 600;
          color: var(--muted-foreground);
        }
        .editor-tabs span {
          padding-bottom: 6px;
        }
        .editor-tabs span.on {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
        }
        .field-label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--muted-foreground);
        }
        .field {
          margin-top: 6px;
          padding: 8px 9px;
          border-radius: 8px;
          background: #fff;
          border: 1.5px solid var(--border);
          font-size: 12px;
          line-height: 1.5;
          color: var(--foreground);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .field.focused {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent);
        }
        .caret {
          display: inline-block;
          width: 1.5px;
          height: 13px;
          margin-left: 1px;
          vertical-align: -2px;
          background: var(--primary);
          animation: blink 0.85s ease infinite;
        }
        @keyframes blink {
          0%,
          45% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
        .hint {
          margin-top: 8px;
          font-size: 11.5px;
          line-height: 1.4;
          color: var(--tour-warn);
        }
        .saved {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--tour-ok);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .saved.show {
          opacity: 1;
        }
        .saved-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--success);
        }

        .thumbs {
          margin-top: 8px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 6px 5px;
        }
        .thumb {
          height: 40px;
          border-radius: 5px;
          overflow: hidden;
          border: 2px solid transparent;
          background: var(--background);
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .thumb.sel {
          border-color: var(--primary);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(45, 58, 46, 0.18);
        }
        .thumb :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
        }
        .swatches {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
        }
        .swatch {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .swatch.sel {
          transform: scale(1.25);
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--foreground);
        }
        .design-name {
          margin-top: 12px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          color: var(--foreground);
        }
        .design-sub {
          margin-top: 2px;
          font-size: 11.5px;
          color: var(--muted-foreground);
        }

        .cursor {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          transition: left 0.8s cubic-bezier(0.3, 0.9, 0.3, 1), top 0.8s cubic-bezier(0.3, 0.9, 0.3, 1), opacity 0.3s ease;
        }
        .cursor.show {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .stage *,
          .stage *::after {
            transition: none !important;
            animation: none !important;
          }
          .delta.show {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
