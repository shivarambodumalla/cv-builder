import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async () => {
  const { data, error } = await db.from("blog_posts").select("slug,title,is_published,published_at,content_html,author_name,tags,cover_image_url").order("published_at", { ascending: false });
  if (error) { console.error(error); return; }
  const pub = (data ?? []).filter(p => p.is_published);
  console.log("total:", data?.length, "published:", pub.length);
  for (const p of pub) {
    const text = (p.content_html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log([String(text.split(" ").filter(Boolean).length).padStart(5), (p.published_at??"").slice(0,10), p.author_name ?? "-", p.cover_image_url ? "img" : "noimg", p.slug].join(" | "));
  }
})();
