#!/usr/bin/env node
/**
 * Optimises public/img/cover.png for fast hero loading.
 * - Resizes to 2200px wide (retina 2x of 1100px max display)
 * - Re-encodes PNG with palette quantisation when possible
 * - Emits a sibling WebP for modern browsers
 *
 * Re-run whenever the cover image is replaced.
 */
import sharp from "sharp";
import { writeFile, stat } from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("public/img/cover.png");
const TARGET_WIDTH = 2200;

async function main() {
  const before = (await stat(SRC)).size;
  const meta = await sharp(SRC).metadata();
  console.log(`input: ${meta.width}x${meta.height} · ${kb(before)} KB`);

  const resized = sharp(SRC).resize({ width: TARGET_WIDTH, withoutEnlargement: true });

  const pngBuf = await resized.clone().png({ compressionLevel: 9, palette: true, effort: 10 }).toBuffer();
  await writeFile(SRC, pngBuf);
  console.log(`png:   ${meta.width && meta.width > TARGET_WIDTH ? TARGET_WIDTH : meta.width}w · ${kb(pngBuf.length)} KB  (${delta(before, pngBuf.length)})`);

  const webpPath = SRC.replace(/\.png$/, ".webp");
  const webpBuf = await resized.clone().webp({ quality: 85, effort: 6 }).toBuffer();
  await writeFile(webpPath, webpBuf);
  console.log(`webp:  ${kb(webpBuf.length)} KB  (${delta(before, webpBuf.length)})`);

  console.log("\nDone. Reference the WebP in your <Image> for best results.");
}

function kb(bytes) { return (bytes / 1024).toFixed(1); }
function delta(from, to) {
  const pct = ((1 - to / from) * 100).toFixed(0);
  return `${pct}% smaller`;
}

main().catch((err) => { console.error(err); process.exit(1); });
