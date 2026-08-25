require("dotenv").config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const SLUGS = process.argv.slice(2);
(async () => {
  for (const s of SLUGS) {
    const { data } = await db.from("blog_posts").select("slug,title,brief,seo_title,seo_description,read_time_minutes,tags,content_html").eq("slug", s).single();
    if (!data) { console.log("MISSING", s); continue; }
    console.log("\n\n########## " + data.slug);
    console.log("TITLE: " + data.title);
    console.log("BRIEF: " + data.brief);
    console.log("SEO_TITLE: " + data.seo_title);
    console.log("SEO_DESC: " + data.seo_description);
    console.log("TAGS: " + JSON.stringify(data.tags));
    console.log("---HTML---");
    console.log(data.content_html);
  }
})();
