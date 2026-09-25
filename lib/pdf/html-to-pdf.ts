import React from "react";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";
import { RESUME_FONTS_URL } from "@/lib/resume/fonts";

const PAPER_SIZES: Record<string, { width: string; height: string }> = {
  a4: { width: "210mm", height: "297mm" },
  letter: { width: "8.5in", height: "11in" },
};

// Viewport must match the PDF page width exactly so the initial DOM layout
// uses the same line-wrap budget as the final PDF render. Mismatch causes
// 1–2px height differences that push content onto a second page.
// Values are CSS pixel equivalents at 96 DPI (Chromium's default DPI).
const PAPER_VIEWPORT: Record<string, { width: number; height: number }> = {
  a4: { width: 794, height: 1123 },       // 210mm × 297mm at 96 DPI
  letter: { width: 816, height: 1056 },   // 8.5in × 11in at 96 DPI
};

// Cache the extracted chromium binary path across warm-lambda invocations.
// sparticuz/chromium extracts the binary to /tmp on first resolve; re-resolving
// can race with a still-open write fd and the kernel returns ETXTBSY.
let chromiumPathPromise: Promise<string> | null = null;
async function getChromiumPath(): Promise<string> {
  if (!chromiumPathPromise) {
    chromiumPathPromise = (async () => {
      const chromium = (await import("@sparticuz/chromium")).default;
      return chromium.executablePath();
    })().catch((err) => {
      // Reset on failure so the next caller can retry the extraction.
      chromiumPathPromise = null;
      throw err;
    });
  }
  return chromiumPathPromise;
}

function isETXTBSY(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException | undefined)?.code;
  const msg = (err as Error | undefined)?.message ?? "";
  return code === "ETXTBSY" || msg.includes("ETXTBSY");
}

async function launchBrowser() {
  const puppeteer = await import("puppeteer-core");

  // Mac dev — use system Chrome. Override via LOCAL_CHROMIUM_PATH.
  if (process.platform === "darwin" && !process.env.VERCEL) {
    const localPath = process.env.LOCAL_CHROMIUM_PATH
      || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    return puppeteer.launch({
      executablePath: localPath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  }

  // Everything else (Vercel serverless, CI, Linux hosts) — use sparticuz's bundled chromium.
  // Retry on ETXTBSY: cold-start race between binary extraction and spawn.
  const chromium = (await import("@sparticuz/chromium")).default;
  const executablePath = await getChromiumPath();

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
    } catch (err) {
      lastErr = err;
      if (!isETXTBSY(err) || attempt === 4) throw err;
      // Backoff: 150ms, 300ms, 450ms — gives the fs write fd time to close.
      await new Promise((r) => setTimeout(r, 150 * attempt));
    }
  }
  throw lastErr;
}

export async function renderHtmlToPdf(
  content: ResumeContent,
  design: ResumeDesignSettings,
  watermark: boolean = false,
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { renderToStaticMarkup } = require("react-dom/server");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TemplateRenderer } = require("@/components/resume/template-renderer");

  const templateHtml = renderToStaticMarkup(
    React.createElement(TemplateRenderer, { content, design })
  );

  const paper = PAPER_SIZES[design.paperSize] || PAPER_SIZES.a4;
  const viewport = PAPER_VIEWPORT[design.paperSize] || PAPER_VIEWPORT.a4;
  // marginY drives the top margin injected on pages 2+ via @page.
  // @page :first keeps page-1 at 0 so template padding handles the first-page spacing.
  const marginYIn = design.marginY ?? 0.5;
  // Watermark footer needs bottom space on every page.
  const pageBottomMargin = watermark ? "20px" : "0";


  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: ${paper.width};
    /* no height — @page controls PDF page size; fixing height here can cause
       content that slightly exceeds one page to overflow onto a blank page 2 */
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Ensure sidebar/column templates fill the full page height */
  body > div {
    min-height: ${paper.height};
  }
  body > div > div[style*="display: flex"],
  body > div > div[style*="display:flex"] {
    min-height: ${paper.height};
  }

  @page {
    size: ${paper.width} ${paper.height};
    /* Pages 2+ get top margin so content doesn't start at the very edge */
    margin: ${marginYIn}in 0 ${pageBottomMargin} 0;
  }
  /* First page: template's own padding handles the top spacing */
  @page :first {
    margin: 0 0 ${pageBottomMargin} 0;
  }
</style>
</head>
<body>
${templateHtml}
</body>
</html>`;

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // Set viewport to match the PDF page dimensions exactly so the initial
    // DOM layout uses the same line-wrap budget as the final PDF render.
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    // Load fonts separately so Puppeteer tracks the stylesheet request, then
    // wait for document.fonts.ready to confirm metrics are applied to the DOM.
    try {
      await page.addStyleTag({ url: RESUME_FONTS_URL });
      await page.evaluate(() => document.fonts.ready);
    } catch {
      // Font loading failure must not abort PDF export — system fallbacks apply.
    }

    // Generic fix: Chromium's print/PDF renderer clips column backgrounds to
    // the column's own content height rather than its stretched height, so a
    // sidebar background (or a column divider drawn as a border) vanishes
    // wherever the shorter column's content ends — on any page.
    // Solution: find page-spanning column containers (a single-row flex or
    // grid), build a linear-gradient from the children's resolved background
    // colours and column borders, paint it on the container and clear the
    // children. Runs after font loading so computed widths are stable.
    await page.evaluate(() => {
      const root = document.querySelector("body > div");
      if (!root) return;

      const TRANSPARENT = "rgba(0, 0, 0, 0)";
      const isColored = (c: string) => c !== TRANSPARENT && c !== "rgb(255, 255, 255)";

      function fixColumnBg(el: Element) {
        const cs = getComputedStyle(el as HTMLElement);
        const isRow =
          (cs.display === "flex" && cs.flexDirection !== "column") ||
          (cs.display === "grid" && cs.gridTemplateColumns !== "none");
        if (!isRow) return;

        const box = (el as HTMLElement).getBoundingClientRect();
        // Only target page-spanning columns (≥ 50 % viewport width). Chip rows,
        // buttons, nav items etc. are left untouched.
        if (box.width < window.innerWidth * 0.5) return;

        const kids = Array.from(el.children).filter(
          (k) => getComputedStyle(k as HTMLElement).display !== "none"
        ) as HTMLElement[];
        if (kids.length < 2) return;
        // A grid laid out as several rows (e.g. quadrants) is not a column split.
        const tops = kids.map((k) => k.getBoundingClientRect().top);
        if (Math.max(...tops) - Math.min(...tops) > 1) return;

        type Seg = { from: number; to: number; color: string };
        const segs: Seg[] = [];
        let hasColor = false;

        kids.forEach((kid) => {
          const kcs = getComputedStyle(kid);
          const r = kid.getBoundingClientRect();
          const from = r.left - box.left;
          const to = r.right - box.left;
          const bg = kcs.backgroundColor;
          if (kcs.backgroundImage !== "none") return; // keep patterned children as they are
          if (isColored(bg)) hasColor = true;
          segs.push({ from, to, color: bg });
          kid.style.backgroundColor = "transparent";

          // Column dividers drawn as borders stop with the column's content
          // too; fold them into the gradient and hide the original.
          const bl = parseFloat(kcs.borderLeftWidth);
          if (bl > 0 && kcs.borderLeftStyle !== "none" && kcs.borderLeftColor !== TRANSPARENT) {
            segs.push({ from, to: from + bl, color: kcs.borderLeftColor });
            kid.style.borderLeftColor = "transparent";
            hasColor = true;
          }
          const br = parseFloat(kcs.borderRightWidth);
          if (br > 0 && kcs.borderRightStyle !== "none" && kcs.borderRightColor !== TRANSPARENT) {
            segs.push({ from: to - br, to, color: kcs.borderRightColor });
            kid.style.borderRightColor = "transparent";
            hasColor = true;
          }
        });

        if (!hasColor) return;
        // Segments overlap (a border sits on its column's fill) and a gradient
        // needs monotonic stops, so rebuild as non-overlapping spans where the
        // last segment covering a span wins.
        const edges = Array.from(new Set(segs.flatMap((sg) => [sg.from, sg.to]))).sort((a, b) => a - b);
        const spans: string[] = [];
        for (let i = 0; i < edges.length - 1; i++) {
          const a = edges[i];
          const b = edges[i + 1];
          if (b - a < 0.01) continue;
          const mid = (a + b) / 2;
          let color = "transparent";
          for (const sg of segs) if (sg.from <= mid && mid <= sg.to) color = sg.color;
          spans.push(`${color} ${a.toFixed(2)}px`, `${color} ${b.toFixed(2)}px`);
        }
        (el as HTMLElement).style.backgroundImage = `linear-gradient(to right, ${spans.join(", ")})`;
      }

      // Walk up to 4 levels from the template root.
      function walk(node: Element, depth: number) {
        if (depth === 0) return;
        Array.from(node.children).forEach((child) => {
          fixColumnBg(child);
          walk(child, depth - 1);
        });
      }

      walk(root, 4);
    });

    // Promote the page canvas background to the root element. The template root
    // only carries a one-page min-height, so when content spills onto a further
    // page and stops part-way, Chromium paints the remainder of that page white.
    // The root element's background propagates to the canvas, which covers every
    // printed page in full. Runs after the column fix so a column gradient is
    // picked up when that is what paints the page. Returns the resolved canvas
    // so the header template can paint the page-2+ top margin, which the
    // canvas background does not reach.
    const canvasBg = await page.evaluate(() => {
      const root = document.querySelector("body > div");
      if (!root) return null;

      const isPainted = (cs: CSSStyleDeclaration) =>
        (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "rgb(255, 255, 255)") ||
        cs.backgroundImage !== "none";

      // Shallowest element that spans the whole first page and paints a background.
      function findCanvas(node: Element, depth: number): CSSStyleDeclaration | null {
        if (depth === 0) return null;
        for (const child of Array.from(node.children)) {
          const r = child.getBoundingClientRect();
          const spansPage =
            r.top <= 1 && r.left <= 1 &&
            r.width >= window.innerWidth * 0.98 &&
            r.bottom >= window.innerHeight - 1;
          if (!spansPage) continue;
          const cs = getComputedStyle(child);
          if (isPainted(cs)) return cs;
          const deeper = findCanvas(child, depth - 1);
          if (deeper) return deeper;
        }
        return null;
      }

      const canvas = findCanvas(root, 4);
      if (!canvas) return null;
      const html = document.documentElement;
      html.style.backgroundColor = canvas.backgroundColor;
      if (canvas.backgroundImage !== "none") html.style.backgroundImage = canvas.backgroundImage;
      return { color: canvas.backgroundColor, image: canvas.backgroundImage };
    });

    // Templates mark per-page furniture (e.g. a corner decoration) with
    // `@media print { position: fixed }`. Chromium repeats a fixed box on
    // every printed page only when it hangs directly off the body; nested
    // inside a fragmented column it prints on the last page alone.
    await page.evaluate(() => {
      const fixed = Array.from(document.body.querySelectorAll<HTMLElement>("*")).filter(
        (el) => getComputedStyle(el).position === "fixed"
      );
      for (const el of fixed) document.body.appendChild(el);
    });

    // Linkify emails and URLs so they are clickable in the exported PDF.
    await page.evaluate(() => {
      const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
      const FULL_URL_RE = /^https?:\/\/.+/i;
      const KNOWN_DOMAIN_RE = /^(?:www\.|linkedin\.com|github\.com|twitter\.com|x\.com|behance\.net|dribbble\.com|gitlab\.com|portfolio\.).+/i;

      function getHref(raw: string): string | null {
        const t = raw.trim();
        if (!t) return null;
        if (EMAIL_RE.test(t)) return `mailto:${t}`;
        if (FULL_URL_RE.test(t)) return t;
        if (KNOWN_DOMAIN_RE.test(t)) return `https://${t}`;
        return null;
      }

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const hits: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const el = (node as Text).parentElement;
        if (!el || el.tagName === "A" || el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
        if (getHref((node as Text).textContent ?? "")) hits.push(node as Text);
      }
      for (const textNode of hits) {
        const href = getHref(textNode.textContent ?? "");
        if (!href || !textNode.parentNode) continue;
        const a = document.createElement("a");
        a.href = href;
        a.textContent = textNode.textContent;
        a.style.cssText = "color:inherit;text-decoration:none;";
        textNode.parentNode.replaceChild(a, textNode);
      }
    });

    // Chromium clips page content and the canvas background to the page area,
    // so the marginY band at the top of pages 2+ stays white. The header box
    // is that band: fill it with the resolved canvas. On page 1 the box is
    // 0 high (@page :first), so nothing shows there. Chromium lays the header
    // template out 20px below the page edge (measured, constant across margin
    // sizes), so the paint layer is pulled up by that much inside a box that
    // still takes the header's height.
    const HEADER_TEMPLATE_OFFSET_PX = 20;
    const headerTemplate = canvasBg
      ? `<div style="position:relative;width:100%;height:100%;margin:0;padding:0">` +
        `<div style="position:absolute;left:0;top:-${HEADER_TEMPLATE_OFFSET_PX}px;width:100%;height:100%;` +
        `background-color:${canvasBg.color};` +
        (canvasBg.image !== "none" ? `background-image:${canvasBg.image};` : "") +
        `-webkit-print-color-adjust:exact;print-color-adjust:exact"></div></div>`
      : "<span></span>";

    const pdfBuffer = await page.pdf({
      width: paper.width,
      height: paper.height,
      margin: watermark
        ? { top: "0", right: "0", bottom: "20px", left: "0" }
        : { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
      displayHeaderFooter: watermark || Boolean(canvasBg),
      headerTemplate,
      footerTemplate: watermark
        ? '<div style="width:100%;text-align:center;font-size:7px;color:#bbb;font-family:system-ui;">Optimised with CVEdge · thecvedge.com</div>'
        : "<span></span>",
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
