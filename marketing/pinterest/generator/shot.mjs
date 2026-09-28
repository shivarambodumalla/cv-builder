// usage: node scripts/_pins-shot.mjs <html-file> <out> <width> <height> [jpeg]
import puppeteer from "puppeteer-core";
const [html, out, w, h, fmt] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--allow-file-access-from-files"] });
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
await p.goto("file://" + html, { waitUntil: "networkidle0" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out, type: fmt === "jpeg" ? "jpeg" : "png", ...(fmt === "jpeg" ? { quality: 88 } : {}), fullPage: true });
await b.close();
