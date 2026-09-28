import fs from "fs";
import { renderHtmlToPdf } from "../../../lib/pdf/html-to-pdf";
import { normalizeDesignSettings } from "../../../lib/resume/normalize";
import { PERSONAS, TEMPLATE_PERSONA } from "./personas";

const OUT = process.argv[2];
const only = process.argv.slice(3);
async function shim() {
  const SHIM = "window.__name = window.__name || function(f){return f}";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mods = [require("puppeteer-core"), await import("puppeteer-core")];
  for (const m of mods) {
    const P = (m.Page ?? m.default?.Page)?.prototype;
    if (!P || P.__shimmed) continue;
    const orig = P.evaluate;
    P.evaluate = async function (fn: unknown, ...args: unknown[]) {
      if (typeof fn === "function") await orig.call(this, SHIM);
      return orig.call(this, fn, ...args);
    };
    P.__shimmed = true;
  }
}
(async () => {
  await shim();
  fs.mkdirSync(OUT, { recursive: true });
  for (const [template, persona] of Object.entries(TEMPLATE_PERSONA)) {
    if (only.length && !only.includes(template)) continue;
    const design = normalizeDesignSettings({ template, paperSize: "letter", ...(template === "harvard" ? { accentColor: "#111111" } : {}) });
    const pdf = await renderHtmlToPdf(PERSONAS[persona], design);
    fs.writeFileSync(`${OUT}/${template}.pdf`, pdf);
    console.log("rendered", template);
  }
})().catch((e) => { console.error(e); process.exit(1); });
