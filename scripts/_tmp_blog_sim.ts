require("dotenv").config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const strip = (h: string) => (h ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const shingles = (t: string, n = 6) => { const w = t.split(" "); const s = new Set<string>(); for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(" ")); return s; };
(async () => {
  const { data } = await db.from("blog_posts").select("slug,title,content_html,is_published").eq("is_published", true);
  const posts = (data ?? []).map(p => { const t = strip(p.content_html as string); return { slug: p.slug as string, title: p.title as string, words: t.split(" ").filter(Boolean).length, sh: shingles(t) }; });
  console.log("=== POSTS UNDER 600 WORDS ===");
  posts.filter(p => p.words < 600).sort((a,b)=>a.words-b.words).forEach(p => console.log(String(p.words).padStart(5), p.slug));
  console.log("\n=== NEAR-DUPLICATE PAIRS (>12% jaccard) ===");
  for (let i = 0; i < posts.length; i++) for (let j = i + 1; j < posts.length; j++) {
    const a = posts[i], b = posts[j];
    if (!a.sh.size || !b.sh.size) continue;
    let inter = 0; a.sh.forEach(s => { if (b.sh.has(s)) inter++; });
    const jac = inter / (a.sh.size + b.sh.size - inter);
    if (jac > 0.12) console.log((jac*100).toFixed(1).padStart(5) + "%", a.slug, "VS", b.slug);
  }
  console.log("\n=== TITLE-LEVEL TOPIC CLUSTERS ===");
  posts.sort((a,b)=>a.title.localeCompare(b.title)).forEach(p => console.log(String(p.words).padStart(5), "|", p.title));
})();
