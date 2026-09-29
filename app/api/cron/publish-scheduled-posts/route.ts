import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitToIndexNow } from "@/lib/seo/indexnow";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();

  // Find all drafts whose scheduled_at has passed
  const { data: posts, error } = await db
    .from("blog_posts")
    .select("id, slug, title, scheduled_at")
    .eq("is_published", false)
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!posts?.length) return NextResponse.json({ published: 0 });

  const ids = posts.map((p) => p.id);

  const { error: updateError } = await db
    .from("blog_posts")
    .update({ is_published: true, published_at: new Date().toISOString(), scheduled_at: null })
    .in("id", ids);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  console.log(`[cron] published ${ids.length} scheduled posts:`, posts.map((p) => p.title));

  // Refresh the hourly ISR cache first so the crawler IndexNow sends sees the
  // new posts, not a stale /blog listing.
  const paths = [...posts.map((p) => `/blog/${p.slug}`), "/blog"];
  paths.forEach((p) => revalidatePath(p));
  await submitToIndexNow(paths);

  return NextResponse.json({ published: ids.length, posts: posts.map((p) => p.title) });
}
