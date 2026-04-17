import React from "react";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

const PAPER_SIZES: Record<string, { width: string; height: string }> = {
  a4: { width: "210mm", height: "297mm" },
  letter: { width: "8.5in", height: "11in" },
};

export async function renderHtmlToPdf(
  content: ResumeContent,
  design: ResumeDesignSettings,
  watermark: boolean = false,
): Promise<Buffer> {
  // Dynamic imports to avoid Next.js bundler restrictions on react-dom/server
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { renderToStaticMarkup } = require("react-dom/server");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TemplateRenderer } = require("@/components/resume/template-renderer");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { chromium } = require("playwright");

  // Render the template to static HTML
  const templateHtml = renderToStaticMarkup(
    React.createElement(TemplateRenderer, { content, design })
  );

  const paper = PAPER_SIZES[design.paperSize] || PAPER_SIZES.a4;

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Lora:wght@400;500;600;700&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: ${paper.width};
    height: ${paper.height};
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
    margin: 0;
  }
</style>
</head>
<body>
${templateHtml}
</body>
</html>`;

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle" });

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
