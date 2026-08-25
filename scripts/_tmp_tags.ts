require("dotenv").config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async () => {
  const { data } = await db.from("blog_posts").select("slug,brief,tags,cover_image_url,seo_description").eq("is_published", true);
  const counts = new Map<string, number>();
  let noBrief = 0, manyTags = 0, noSeoDesc = 0;
  for (const p of data ?? []) {
    const tags = (p.tags as string[]) ?? [];
    tags.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1));
    if (!p.brief || !String(p.brief).trim()) { noBrief++; console.log("NO BRIEF:", p.slug); }
    if (!p.seo_description || !String(p.seo_description).trim()) noSeoDesc++;
    if (tags.length > 6) { manyTags++; console.log(`TAGS(${tags.length}):`, p.slug); }
  }
  console.log(`\nposts=${data?.length} noBrief=${noBrief} noSeoDesc=${noSeoDesc} postsWith>6tags=${manyTags}`);
  console.log("\n=== JUNK-LOOKING TAGS (used once, long or id-like) ===");
  [...counts.entries()].filter(([t,c]) => c === 1 && (t.length > 22 || /[0-9a-z]{20,}/.test(t))).forEach(([t,c]) => console.log(" ", t));
  console.log("\n=== TAG VOCAB SIZE ===", counts.size);
})();
