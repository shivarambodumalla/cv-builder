"use client";

import { useEffect, useRef } from "react";

type Template = { slug: string; name: string; ac: string; tier: "Free" | "Pro" };

const TPL: Template[] = [
  { slug: "orchid", name: "Orchid", ac: "#9F1239", tier: "Free" },
  { slug: "clean-sidebar", name: "Clean Sidebar", ac: "#B45309", tier: "Free" },
  { slug: "aurora", name: "Aurora", ac: "#1E3A8A", tier: "Free" },
  { slug: "executive-pro", name: "Executive Pro", ac: "#3182CE", tier: "Pro" },
  { slug: "coastal", name: "Coastal", ac: "#0F766E", tier: "Free" },
  { slug: "wentworth", name: "Wentworth", ac: "#555555", tier: "Pro" },
  { slug: "electric-lilac", name: "Electric Lilac", ac: "#7C3AED", tier: "Pro" },
  { slug: "bold-accent", name: "Bold Accent", ac: "#E53E3E", tier: "Free" },
];

// Font option labels, in the order they're rendered in JSX:
// [Classic, Clean, Elegant, Strong].
const FONT_NAMES = ["Classic", "Clean", "Elegant", "Strong"];

// Tunable pacing — ms added to each interaction beat (template rotation,
// color cycling, font cycling). Bump up to slow things down, drop for snappier.
const EXTRA_DELAY = 500;

const DEFAULT_SLUG = TPL[0].slug;
const DEFAULT_AC = TPL[0].ac;
const ROTATION = TPL.slice(1)
  .map((t) => t.slug)
  .concat(DEFAULT_SLUG);

const COL = [
  { c: "#065F46", n: "Emerald", hr: 0, sat: 1.0, br: 1.0 },
  { c: "#1E3A8A", n: "Navy", hr: -50, sat: 0.85, br: 0.9 },
  { c: "#7E22CE", n: "Violet", hr: 115, sat: 1.4, br: 0.95 },
  { c: "#DC2626", n: "Crimson", hr: 148, sat: 1.6, br: 1.0 },
  { c: "#C2410C", n: "Rust", hr: 40, sat: 1.5, br: 1.0 },
  { c: "#0F766E", n: "Teal", hr: -18, sat: 1.2, br: 1.0 },
  { c: "#9F1239", n: "Burgundy", hr: 160, sat: 1.5, br: 0.88 },
  { c: "#1D4ED8", n: "Royal", hr: -55, sat: 1.0, br: 0.95 },
  { c: "#B45309", n: "Cognac", hr: 32, sat: 1.3, br: 1.0 },
  { c: "#831843", n: "Wine", hr: 165, sat: 1.4, br: 0.85 },
  { c: "#374151", n: "Slate", hr: 0, sat: 0.0, br: 0.82 },
  { c: "#14532D", n: "Forest", hr: -8, sat: 1.2, br: 0.85 },
];

const imgSrc = (slug: string) =>
  `/_next/image?url=${encodeURIComponent(`/img/templates/${slug}.jpg`)}&w=640&q=80`;

export function HeroAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
      root.querySelector(sel) as T;
    const qa = <T extends HTMLElement = HTMLElement>(sel: string) =>
      Array.from(root.querySelectorAll(sel)) as T[];

    const stage = q('[data-el="stage"]');
    const i0 = q<HTMLImageElement>('[data-el="i0"]');
    const i1 = q<HTMLImageElement>('[data-el="i1"]');
    const i2 = q<HTMLImageElement>('[data-el="i2"]');
    const rp = q('[data-el="rp"]');
    const ep = q('[data-el="ep"]');
    const pill = q('[data-el="pill"]');
    const phoneTxt = q('[data-el="phoneTxt"]');
    const phoneField = q('[data-el="phoneField"]');
    const epSaved = q('[data-el="epSaved"]');
    const toast = q('[data-el="toast"]');
    const ttxt = q('[data-el="ttxt"]');

    let cancelled = false;
    const timers = new Set<number>();

    // Scale the fixed-size stage to fit whatever column width we land in.
    // Container aspect matches stage exactly (720×520) so the content fills
    // the frame with no external padding — scale = container_width / stage_width.
    const resizeObserver = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const scale = Math.min(1, w / 720);
      stage.style.setProperty("--scale", String(scale));
    });
    resizeObserver.observe(root);

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) return resolve();
        const t = window.setTimeout(() => {
          timers.delete(t);
          resolve();
        }, ms);
        timers.add(t);
      });

    const mv = (x: number, y: number) => {
      pill.style.left = `${x}px`;
      pill.style.top = `${y}px`;
    };

    const hidePanels = () => {
      rp.classList.remove("on");
      ep.classList.remove("on");
    };

    const showPanel = (which: "rp" | "ep") => {
      hidePanels();
      (which === "rp" ? rp : ep).classList.add("on");
    };

    let toastTimer = 0;
    const showToast = (m: string) => {
      ttxt.textContent = m;
      toast.classList.add("on");
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("on"), 1100);
      timers.add(toastTimer);
    };

    const setAccent = (color: string) => {
      root.style.setProperty("--a", color);
    };

    let curF = "";

    const swap = (slug: string) => {
      const t = TPL.find((x) => x.slug === slug);
      if (!t) return;
      i0.style.opacity = "0";
      i0.style.transition = "opacity 0.2s";
      const after = window.setTimeout(() => {
        timers.delete(after);
        if (cancelled) return;
        i0.src = imgSrc(slug);
        i0.style.filter = curF;
        const onLoad = () => {
          i0.style.opacity = "1";
          i0.style.transition = "opacity 0.3s, filter 0.45s";
        };
        i0.onload = onLoad;
        if (i0.complete) onLoad();
        const others = TPL.filter((x) => x.slug !== slug);
        if (others[0]) i1.src = imgSrc(others[0].slug);
        if (others[1]) i2.src = imgSrc(others[1].slug);
      }, 200);
      timers.add(after);
      qa<HTMLElement>(".ti").forEach((el) =>
        el.classList.toggle("on", el.dataset.slug === slug)
      );
    };

    // Show only the requested section of the right-hand panel; the other
    // sections are fully hidden (not dimmed) so the user's attention goes
    // to exactly one interaction at a time.
    const rpFocus = (section: "tpl" | "color" | "font") => {
      qa<HTMLElement>("[data-sec]").forEach((el) => {
        el.style.display = el.dataset.sec === section ? "block" : "none";
      });
    };


    async function doEdit() {
      phoneTxt.textContent = "+1 (765) 434-533x";
      phoneField.classList.add("focused");
      epSaved.classList.remove("on");
      await wait(600);
      let s = "+1 (765) 434-533x";
      while (s.length > 0 && !cancelled) {
        s = s.slice(0, -1);
        phoneTxt.textContent = s;
        await wait(44);
      }
      await wait(150);
      const n = "+44 7700 900855";
      for (const ch of n) {
        if (cancelled) return;
        s += ch;
        phoneTxt.textContent = s;
        await wait(64);
      }
      await wait(350);
      phoneField.classList.remove("focused");
      epSaved.classList.add("on");
      await wait(1300);
      epSaved.classList.remove("on");
    }

    // Init stack images
    i0.src = imgSrc(TPL[0].slug);
    i1.src = imgSrc(TPL[1].slug);
    i2.src = imgSrc(TPL[2].slug);

    async function loop() {
      while (!cancelled) {
        // 0 — Template selection
        hidePanels();
        swap(DEFAULT_SLUG);
        setAccent(DEFAULT_AC);
        mv(310, 46);
        await wait(600);
        if (cancelled) return;
        showPanel("rp");
        rpFocus("tpl");
        mv(470, 160);
        await wait(900);
        for (const slug of ROTATION) {
          await wait(950 + EXTRA_DELAY);
          if (cancelled) return;
          const t = TPL.find((x) => x.slug === slug);
          if (!t) continue;
          setAccent(t.ac);
          swap(slug);
          showToast(t.name + (t.tier === "Pro" ? " · Pro ✦" : ""));
        }
        await wait(400);

        // 1 — Live edit
        hidePanels();
        swap(DEFAULT_SLUG);
        setAccent(DEFAULT_AC);
        mv(100, 180);
        await wait(380);
        if (cancelled) return;
        showPanel("ep");
        mv(184, 278);
        await wait(580);
        if (cancelled) return;
        await doEdit();
        await wait(180);

        // 2 — Accent color
        hidePanels();
        swap(DEFAULT_SLUG);
        curF = "";
        i0.style.filter = "";
        showPanel("rp");
        rpFocus("color");
        mv(470, 310);
        await wait(700);
        for (const ci of [2, 3, 4, 5, 6, 8, 0]) {
          await wait(680 + EXTRA_DELAY);
          if (cancelled) return;
          const cd = COL[ci];
          setAccent(cd.c);
          // Saturation is intentionally omitted — the saturate() component
          // drives otherwise-natural hue shifts into neon territory. Keeping
          // only hue-rotate + brightness gives a realistic recolor.
          const f =
            cd.hr === 0 && cd.br === 1.0
              ? ""
              : `hue-rotate(${cd.hr}deg) brightness(${cd.br})`;
          curF = f;
          i0.style.filter = f;
          i0.style.transition = "filter 0.45s ease";
          qa<HTMLElement>(".sw").forEach((s) =>
            s.classList.toggle("on", s.dataset.c === cd.c)
          );
          showToast(cd.n);
        }
        await wait(280);
        curF = "";
        i0.style.filter = "";

        // 3 — Font (we can't re-typeset a baked JPG, so feedback is limited
        // to the panel option highlight + a toast)
        setAccent(DEFAULT_AC);
        rpFocus("font");
        mv(470, 430);
        await wait(500);
        const fos = qa<HTMLElement>(".fo");
        for (const fi of [1, 3, 2, 0]) {
          await wait(820 + EXTRA_DELAY);
          if (cancelled) return;
          fos.forEach((f) => f.classList.remove("on"));
          fos[fi].classList.add("on");
          showToast(FONT_NAMES[fi] + " font");
        }
        qa<HTMLElement>(".sw").forEach((s) =>
          s.classList.toggle("on", s.dataset.c === DEFAULT_AC)
        );
        await wait(350);
      }
    }

    const start = window.setTimeout(() => {
      timers.delete(start);
      mv(300, 46);
      loop();
    }, 800);
    timers.add(start);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="hero-anim" ref={rootRef} aria-hidden="true" role="presentation">
      <div className="stage" data-el="stage">
        <div className="rstack">
          <div className="rcard s2">
            <img data-el="i2" alt="" />
          </div>
          <div className="rcard s1">
            <img data-el="i1" alt="" />
          </div>
          <div className="rcard main">
            <img data-el="i0" alt="" />
          </div>
        </div>

        <div className="panel rp" data-el="rp">
          <div className="rp-sec" data-sec="tpl">
            <div className="sec">Templates</div>
            <div className="tgd">
              {TPL.map((t, i) => (
                <div
                  key={t.slug}
                  className={`ti${i === 0 ? " on" : ""}`}
                  data-slug={t.slug}
                >
                  <img src={imgSrc(t.slug)} alt={`${t.name} resume template preview`} title={`${t.name} resume template preview`} loading="lazy" />
                  <div
                    className={`tier-chip ${t.tier === "Pro" ? "tier-pro" : "tier-free"}`}
                  >
                    {t.tier}
                  </div>
                  <div className="tinm">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rp-sec" data-sec="color" style={{ display: "none" }}>
            <div className="sec">Accent Color</div>
            <div className="cgd">
              {COL.map((c, i) => (
                <div
                  key={c.c}
                  className={`sw${i === 0 ? " on" : ""}`}
                  data-c={c.c}
                  style={{ background: c.c }}
                />
              ))}
            </div>
          </div>
          <div className="rp-sec" data-sec="font" style={{ display: "none" }}>
            <div className="sec">Font Style</div>
            <div className="fgd">
              <div className="fo on">
                <div className="faa" style={{ fontFamily: "Georgia, serif" }}>
                  Aa
                </div>
                <div className="fnm">Classic</div>
              </div>
              <div className="fo">
                <div className="faa" style={{ fontWeight: 300 }}>
                  Aa
                </div>
                <div className="fnm">Clean</div>
              </div>
              <div className="fo">
                <div
                  className="faa"
                  style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                >
                  Aa
                </div>
                <div className="fnm">Elegant</div>
              </div>
              <div className="fo">
                <div className="faa" style={{ fontWeight: 800 }}>
                  Aa
                </div>
                <div className="fnm">Strong</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel ep" data-el="ep">
          <div className="ep-head">
            <div className="ep-tabs">
              <span className="ep-tab on">Content</span>
              <span className="ep-tab">Design</span>
              <span className="ep-tab">ATS</span>
            </div>
          </div>
          <div className="ep-sec">Contact</div>
          <div className="ep-body">
            <div className="ep-field">
              <div className="ep-lbl">Full Name</div>
              <div className="ep-muted">SARAH MITCHELL</div>
            </div>
            <div className="ep-field">
              <div className="ep-lbl">Phone</div>
              <div className="ep-input focused" data-el="phoneField">
                <span className="ep-input-txt" data-el="phoneTxt">
                  +1 (765) 434-533x
                </span>
                <div className="ep-cursor" />
              </div>
            </div>
            <div className="ep-field">
              <div className="ep-lbl">Email</div>
              <div className="ep-muted">sarh.mitchel@gmail.com</div>
            </div>
          </div>
          <div className="ep-saved" data-el="epSaved">
            <div className="ep-saved-dot" />
            Changes saved
          </div>
        </div>

        <div className="pill" data-el="pill" style={{ left: 300, top: 48 }}>
          <div className="pav">
            <div className="pav-inner">S</div>
          </div>
          Sarah
        </div>

        <div className="toast" data-el="toast">
          <div className="tdot" />
          <span data-el="ttxt" />
        </div>
      </div>

      <style jsx>{`
        .hero-anim {
          --a: #065f46;
          --a2: #34d399;
          --cream: #f7f5f0;
          --border: #e0d8cc;
          --muted: #78716c;
          --text: #1c1917;
          --sh: 0 20px 52px rgba(0, 0, 0, 0.16), 0 4px 14px rgba(0, 0, 0, 0.07);
          --r: 12px;

          position: relative;
          width: 100%;
          aspect-ratio: 720 / 520;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }
        .hero-anim::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(6, 95, 70, 0.09) 1px,
            transparent 1px
          );
          background-size: 26px 26px;
          pointer-events: none;
          z-index: 0;
        }
        .stage {
          position: relative;
          z-index: 1;
          width: 720px;
          height: 520px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(var(--scale, 1));
          transform-origin: center center;
        }

        .rstack {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 340px;
          height: 440px;
          transform: translate(-55%, -54%);
        }
        .rcard {
          position: absolute;
          background: white;
          border-radius: var(--r);
          overflow: hidden;
          transition: transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1),
            filter 0.5s ease;
        }
        .rcard.s2 {
          transform: translate(11px, -8px) rotate(-3deg) scale(0.95);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          z-index: 1;
          filter: brightness(0.86);
        }
        .rcard.s1 {
          transform: translate(5.5px, -4px) rotate(-1.5deg) scale(0.975);
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.12);
          z-index: 2;
          filter: brightness(0.94);
        }
        .rcard.main {
          transform: none;
          box-shadow: var(--sh);
          z-index: 3;
        }
        .rcard :global(img) {
          width: 340px;
          display: block;
          transition: opacity 0.22s ease, filter 0.45s ease;
        }
        .panel {
          position: absolute;
          background: white;
          border-radius: var(--r);
          box-shadow: var(--sh);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease,
            transform 0.5s cubic-bezier(0.34, 1.15, 0.64, 1);
          will-change: transform, opacity;
          z-index: 20;
        }
        .panel.on {
          opacity: 1;
          pointer-events: auto;
        }
        .sec {
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .rp {
          right: 30px;
          top: 50%;
          transform: translateY(-50%) translateX(18px);
          width: 200px;
          padding: 14px 13px;
        }
        .rp.on {
          transform: translateY(-50%) translateX(0);
        }

        .tgd {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 0;
        }
        .ti {
          cursor: pointer;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative;
          background: #f8f8f8;
        }
        .ti :global(img) {
          width: 100%;
          display: block;
          aspect-ratio: 0.72;
          object-fit: cover;
          object-position: top;
        }
        .tinm {
          font-size: 6px;
          font-weight: 600;
          color: #555;
          text-align: center;
          padding: 2px 2px 3px;
          background: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ti.on {
          border-color: var(--a);
          transform: scale(1.06);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.14);
        }
        .ti.on::after {
          content: "✓";
          position: absolute;
          top: 2px;
          right: 2px;
          background: var(--a);
          color: white;
          font-size: 6.5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 12px;
        }
        .tier-chip {
          position: absolute;
          top: 2px;
          left: 2px;
          font-size: 5.5px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 20px;
        }
        .tier-pro {
          background: rgba(91, 76, 246, 0.85);
          color: white;
        }
        .tier-free {
          background: rgba(6, 95, 70, 0.85);
          color: white;
        }

        .cgd {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
        }
        .sw {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .sw.on {
          transform: scale(1.28) !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
          outline: 2.5px solid white;
          outline-offset: 2px;
        }

        .fgd {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
        }
        .fo {
          border: 1.5px solid #ece9e4;
          border-radius: 7px;
          padding: 6px 4px;
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .fo.on {
          border-color: var(--a);
          background: rgba(6, 95, 70, 0.05);
        }
        .faa {
          font-size: 16px;
          color: #2d2d2d;
          line-height: 1;
          margin-bottom: 2px;
        }
        .fnm {
          font-size: 7.5px;
          color: #999;
        }

        .ep {
          left: 20px;
          top: 50%;
          transform: translateY(-50%) translateX(-18px);
          width: 186px;
          padding: 0;
          border-radius: var(--r);
          overflow: hidden;
        }
        .ep.on {
          transform: translateY(-50%) translateX(0);
        }
        .ep-head {
          background: var(--cream);
          padding: 9px 13px 0;
          border-bottom: 1px solid var(--border);
        }
        .ep-tabs {
          display: flex;
          gap: 10px;
        }
        .ep-tab {
          font-size: 8px;
          font-weight: 600;
          color: #aaa;
          padding-bottom: 7px;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color 0.2s;
        }
        .ep-tab.on {
          color: var(--a);
          border-color: var(--a);
        }
        .ep-sec {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 8px 13px 5px;
          background: var(--cream);
          border-bottom: 1px solid var(--border);
        }
        .ep-body {
          padding: 9px 13px 11px;
          background: var(--cream);
        }
        .ep-field {
          margin-bottom: 8px;
        }
        .ep-field:last-child {
          margin-bottom: 0;
        }
        .ep-lbl {
          font-size: 8.5px;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 3px;
        }
        .ep-input {
          background: white;
          border: 1.5px solid var(--border);
          border-radius: 7px;
          padding: 7px 9px;
          font-size: 11.5px;
          font-weight: 400;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 1px;
          min-height: 33px;
        }
        .ep-input.focused {
          border-color: var(--a);
          box-shadow: 0 0 0 3px rgba(6, 95, 70, 0.12);
        }
        .ep-input-txt {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
        }
        .ep-cursor {
          width: 1.5px;
          height: 13px;
          background: var(--a);
          animation: blink 0.85s ease infinite;
          flex-shrink: 0;
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
        .ep-muted {
          background: white;
          border: 1.5px solid #ece9e4;
          border-radius: 7px;
          padding: 7px 9px;
          font-size: 11.5px;
          color: #c4bfba;
          min-height: 33px;
        }
        .ep-saved {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 600;
          color: var(--a);
          padding: 6px 13px 9px;
          background: var(--cream);
          border-top: 1px solid var(--border);
          opacity: 0;
          transition: opacity 0.35s;
        }
        .ep-saved.on {
          opacity: 1;
        }
        .ep-saved-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--a2);
          flex-shrink: 0;
        }

        .pill {
          position: absolute;
          z-index: 50;
          background: #4f46e5;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 11px 4px 4px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.42);
          pointer-events: none;
          white-space: nowrap;
          transition: left 0.85s cubic-bezier(0.34, 1.4, 0.64, 1),
            top 0.85s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .pav {
          width: 21px;
          height: 21px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
        }
        .pav-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #fbbf24, #f472b6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: 700;
          border-radius: 50%;
        }

        .toast {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          background: var(--a);
          color: white;
          font-size: 10.5px;
          font-weight: 500;
          padding: 5px 14px 5px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.25s, transform 0.25s;
          pointer-events: none;
          z-index: 100;
        }
        .toast.on {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .tdot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--a2);
          flex-shrink: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .rcard,
          .panel,
          .pill,
          .sw {
            transition: none !important;
          }
          .ep-cursor {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
