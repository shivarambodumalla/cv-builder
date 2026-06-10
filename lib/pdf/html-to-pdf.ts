import React from "react";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

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

  const GOOGLE_FONTS_URL =
    "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Lora:wght@400;500;600;700&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap";

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
      await page.addStyleTag({ url: GOOGLE_FONTS_URL });
      await page.evaluate(() => document.fonts.ready);
    } catch {
      // Font loading failure must not abort PDF export — system fallbacks apply.
    }

    // Generic fix: Chromium's print/PDF renderer can clip flex-item backgrounds to the item's
    // intrinsic (content) height rather than its flex-stretched height, causing sidebar/column
    // backgrounds to vanish wherever the shorter column's content ends — on any page.
    // Solution: detect all wide horizontal flex containers, build a linear-gradient from the
    // children's resolved background-colors, apply it to the container, and clear the children.
    // This runs after font loading so computed widths are stable.
    await page.evaluate(() => {
      const root = document.querySelector("body > div");
      if (!root) return;

      function fixFlexColumnBg(el: Element) {
        const cs = getComputedStyle(el as HTMLElement);
        if (cs.display !== "flex" || cs.flexDirection === "column") return;

        const containerW = (el as HTMLElement).getBoundingClientRect().width;
        // Only target page-spanning columns (≥ 50 % viewport width). Chip rows, buttons,
        // nav items etc. are left untouched.
        if (containerW < window.innerWidth * 0.5) return;

        const kids = Array.from(el.children).filter(
          (k) => getComputedStyle(k as HTMLElement).display !== "none"
        ) as HTMLElement[];
        if (kids.length < 2) return;

        const stops: string[] = [];
        let pos = 0;
        let hasColor = false;

        kids.forEach((kid) => {
          const bg = getComputedStyle(kid).backgroundColor;
          const pct = (kid.getBoundingClientRect().width / containerW) * 100;

          // Transparent = rgba(0,0,0,0); white = rgb(255,255,255) — no gradient needed.
          const isColored =
            bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(255, 255, 255)";
          if (isColored) hasColor = true;

          stops.push(`${bg} ${pos.toFixed(3)}%`);
          pos += pct;
          stops.push(`${bg} ${pos.toFixed(3)}%`);

          // Clear the child background so the parent gradient shows through.
          kid.style.background = "transparent";
          kid.style.backgroundColor = "transparent";
        });

        if (hasColor) {
          (el as HTMLElement).style.background =
            `linear-gradient(to right, ${stops.join(", ")})`;
        }
      }

      // Walk up to 4 levels from the template root.
      function walk(node: Element, depth: number) {
        if (depth === 0) return;
        Array.from(node.children).forEach((child) => {
          fixFlexColumnBg(child);
          walk(child, depth - 1);
        });
      }

      walk(root, 4);
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

    const pdfBuffer = await page.pdf({
      width: paper.width,
      height: paper.height,
      margin: watermark
        ? { top: "0", right: "0", bottom: "20px", left: "0" }
        : { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
      displayHeaderFooter: watermark,
      headerTemplate: "<span></span>",
      footerTemplate: watermark
        ? '<div style="width:100%;text-align:center;font-size:7px;color:#bbb;font-family:system-ui;">Optimised with CVEdge · thecvedge.com</div>'
        : "<span></span>",
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
