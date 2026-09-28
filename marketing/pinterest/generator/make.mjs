// usage: node scripts/_pins-make.mjs <scratch-dir>   (reads <dir>/png/*.png, leaves.json; writes <dir>/pins/*.png + pins.json)
import fs from "fs";
import puppeteer from "puppeteer-core";
import { PINS } from "./data.mjs";

const SP = process.argv[2];
const ROOT = process.cwd();
const FONT = `${ROOT}/node_modules/geist/dist/fonts/geist-sans`;
const LOGO = `${ROOT}/public/img/CV-Edge-Logo.svg`;
const LOGO_DARK = `${ROOT}/public/img/cvEdge_logo_dark.svg`;
fs.mkdirSync(`${SP}/pins`, { recursive: true });

const CSS = `
@font-face{font-family:G;src:url(${FONT}/Geist-Regular.woff2);font-weight:400}
@font-face{font-family:G;src:url(${FONT}/Geist-Medium.woff2);font-weight:500}
@font-face{font-family:G;src:url(${FONT}/Geist-SemiBold.woff2);font-weight:600}
@font-face{font-family:G;src:url(${FONT}/Geist-Bold.woff2);font-weight:700}
@font-face{font-family:G;src:url(${FONT}/Geist-ExtraBold.woff2);font-weight:800}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1000px;height:1500px;overflow:hidden;font-family:G,sans-serif;letter-spacing:-0.01em}
.pill{display:inline-flex;align-items:center;gap:12px;font-weight:600;font-size:26px;letter-spacing:.06em;text-transform:uppercase;padding:14px 24px;border-radius:999px}
.pill i{width:12px;height:12px;border-radius:50%;background:#34D399;display:block}
h1{font-weight:800;line-height:1.02;letter-spacing:-0.035em;text-wrap:balance}
.sub{font-weight:500;line-height:1.25;text-wrap:balance}
.sheet{position:absolute;background:#fff;border-radius:6px;overflow:hidden}
.sheet img{width:100%;display:block}
.brand{position:absolute;display:flex;align-items:center;gap:22px}
.brand img{height:52px}
.brand span{font-weight:600;font-size:28px}
.checks{display:flex;flex-direction:column;gap:18px}
.checks div{display:flex;gap:16px;align-items:center;font-size:32px;font-weight:600}
.checks b{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:24px;flex:none}
.cta{display:inline-block;font-weight:700;font-size:34px;padding:24px 40px;border-radius:14px}
`;

function title(p) {
  return p.kw.includes(p.em)
    ? p.kw.replace(p.em, `<em>${p.em}</em>`)
    : `${p.kw}`;
}
const pillText = (p) => (p.ats ? "Free · ATS-friendly" : "Free · Edit online");
const checks = (p) => [
  p.docx ? "Word & PDF download" : "Download as PDF",
  p.ats ? "Reads cleanly in Workday & Greenhouse" : "US Letter size, one page",
  "Edit online free, no card",
];

// A — light beige, headline on top, full sheet below
const A = (p, img, h1 = title(p)) => `
<body style="background:#f5f0e8;color:#10201e">
<div style="position:absolute;left:0;right:0;top:0;height:1500px;background:radial-gradient(circle at 85% 8%,rgba(26,122,109,.14),transparent 45%)"></div>
<div style="position:absolute;left:70px;right:70px;top:70px">
  <div class="pill" style="background:#1a7a6d;color:#fff"><i></i>${pillText(p)}</div>
  <h1 style="font-size:84px;margin-top:34px">${h1.replace(/<em>/g,'<em style="font-style:normal;color:#1a7a6d">')}</h1>
  <p class="sub" style="font-size:36px;margin-top:22px;color:#3d4f4c">${p.sub}</p>
</div>
<div style="position:absolute;left:150px;right:0;bottom:0;top:700px;background:#ece5d8;border-top-left-radius:40px"></div>
<div class="sheet" style="left:120px;width:760px;top:520px;box-shadow:0 30px 70px rgba(16,32,30,.28),0 2px 6px rgba(16,32,30,.12)"><img src="${img}"></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(transparent,#f5f0e8 70%)"></div>
<div class="brand" style="left:70px;bottom:52px"><img src="${LOGO}"><span style="color:#3d4f4c">thecvedge.com</span></div>
</body>`;

// B — brand green, tilted sheet, check list
const B = (p, img, h1 = title(p)) => `
<body style="background:#065F46;color:#fff">
<svg style="position:absolute;right:-220px;top:-220px" width="760" height="760"><circle cx="380" cy="380" r="300" fill="none" stroke="#34D399" stroke-opacity=".35" stroke-width="3"/><circle cx="380" cy="380" r="370" fill="none" stroke="#34D399" stroke-opacity=".18" stroke-width="3"/></svg>
<div style="position:absolute;left:70px;right:70px;top:78px">
  <h1 style="font-size:80px">${h1.replace(/<em>/g,'<em style="font-style:normal;color:#34D399">')}</h1>
  <p class="sub" style="font-size:34px;margin-top:22px;color:#d1fae5">Free template for ${p.who}</p>
</div>
<div class="sheet" style="left:150px;width:700px;top:430px;transform:rotate(-3deg);box-shadow:0 40px 80px rgba(0,0,0,.4)"><img src="${img}"></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:430px;background:linear-gradient(transparent,#065F46 38%)"></div>
<div class="checks" style="position:absolute;left:70px;bottom:150px">${checks(p).map(c=>`<div><b style="background:#34D399;color:#065F46">✓</b>${c}</div>`).join("")}</div>
<div class="brand" style="left:70px;bottom:52px"><img src="${LOGO_DARK}"><span style="color:#d1fae5">thecvedge.com</span></div>
</body>`;

// C — close-up of the top of the page, beige panel with CTA
const C = (p, img, h1 = title(p)) => `
<body style="background:#10201e">
<div style="position:absolute;left:-60px;right:-60px;top:0;height:980px;overflow:hidden">
  <img src="${img}" style="width:1120px;display:block;margin:0 auto">
</div>
<div style="position:absolute;left:0;right:0;top:700px;height:260px;background:linear-gradient(transparent,rgba(16,32,30,.35))"></div>
<div style="position:absolute;left:0;right:0;bottom:0;top:900px;background:#f5f0e8;border-top-left-radius:44px;border-top-right-radius:44px;padding:56px 70px 0;color:#10201e">
  <div class="pill" style="background:#e1f1ee;color:#1a7a6d"><i></i>${pillText(p)}</div>
  <h1 style="font-size:70px;margin-top:26px">${h1.replace(/<em>/g,'<em style="font-style:normal;color:#1a7a6d">')}</h1>
  <p class="sub" style="font-size:32px;margin-top:18px;color:#3d4f4c">${p.sub}</p>
  <div style="margin-top:36px;display:flex;align-items:center;gap:28px">
    <span class="cta" style="background:#065F46;color:#fff">Use it free →</span>
    <span style="font-size:26px;color:#3d4f4c;font-weight:500;line-height:1.4">${checks(p)[2]}<br><b style="color:#10201e">thecvedge.com</b></span>
  </div>
</div>
</body>`;

// Extra Harvard angles — it is the page that already ranks and converts.
const HARVARD_EXTRA = [
  ["A", "Harvard Resume Format for <em>College Students</em>", "harvard-students"],
  ["B", "The <em>Harvard</em> Resume, Free in Word", "harvard-word"],
  ["C", "<em>Harvard-Style</em> Resume That Beats the ATS", "harvard-ats"],
];

const leaves = JSON.parse(fs.readFileSync(`${SP}/leaves.json`, "utf8"));
const jobs = [];
for (const [t, p] of Object.entries(PINS)) {
  const leaf = leaves.find((l) => l.template === t);
  if (!leaf) throw new Error("no leaf for " + t);
  const img = `${SP}/png/${t}.png`;
  for (const [v, fn] of [["A", A], ["B", B], ["C", C]]) jobs.push({ id: `${t}-${v.toLowerCase()}`, template: t, variant: v, html: fn(p, img), path: leaf.path, headline: p.kw });
  if (t === "harvard") for (const [v, h, id] of HARVARD_EXTRA) jobs.push({ id, template: t, variant: v, html: { A, B, C }[v](p, img, h), path: leaf.path, headline: h.replace(/<\/?em>/g, "") });
}

const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--allow-file-access-from-files"] });
const pg = await b.newPage();
await pg.setViewport({ width: 1000, height: 1500 });
const only = process.argv.slice(3);
for (const j of jobs) {
  if (only.length && !only.includes(j.id)) continue;
  fs.writeFileSync(`${SP}/pin.html`, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head>${j.html}</html>`);
  await pg.goto(`file://${SP}/pin.html`, { waitUntil: "networkidle0" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${SP}/pins/${j.id}.png`, clip: { x: 0, y: 0, width: 1000, height: 1500 } });
}
await b.close();
fs.writeFileSync(`${SP}/pins.json`, JSON.stringify(jobs.map(({ html, ...r }) => r), null, 1));
console.log(jobs.length, "pins");
