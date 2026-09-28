import fs from "fs";
import { createAdminClient } from "../../../lib/supabase/admin";
const SP = process.argv[2];
(async () => {
  const db = createAdminClient();
  const files = fs.readdirSync(`${SP}/pins`).filter((f) => f.endsWith(".png"));
  const urls: Record<string, string> = {};
  for (const f of files) {
    const path = `pinterest/${f}`;
    const { error } = await db.storage.from("blog-images").upload(path, fs.readFileSync(`${SP}/pins/${f}`), { contentType: "image/png", upsert: true, cacheControl: "31536000" });
    if (error) throw new Error(`${f}: ${error.message}`);
    urls[f.replace(".png", "")] = db.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
  }
  fs.writeFileSync(`${SP}/pin-urls.json`, JSON.stringify(urls, null, 1));
  console.log("uploaded", files.length);
})().catch((e) => { console.error(e); process.exit(1); });
