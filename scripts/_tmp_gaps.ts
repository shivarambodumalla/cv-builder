require("dotenv").config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async () => {
  const { data } = await db.from("blog_posts").select("slug,title,brief,seo_description,tags").eq("is_published", true).order("slug");
  console.log("=== NO BRIEF (need one written) ===");
  for (const p of data ?? []) if (!String(p.brief ?? "").trim()) console.log(`${p.slug}\n    TITLE: ${p.title}\n    SEO_DESC: ${p.seo_description ?? "(none)"}`);
  console.log("\n=== ALL TAGS PER POST ===");
  for (const p of data ?? []) console.log(p.slug, "=>", JSON.stringify(p.tags));
})();
