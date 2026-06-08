import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();

  // Find all drafts whose scheduled_at has passed
  const { data: posts, error } = await db
    .from("blog_posts")
    .select("id, title, scheduled_at")
    .eq("is_published", false)
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!posts?.length) return NextResponse.json({ published: 0 });

  const ids = posts.map((p) => p.id);

  const { error: updateError } = await db
    .from("blog_posts")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .in("id", ids);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  console.log(`[cron] published ${ids.length} scheduled posts:`, posts.map((p) => p.title));
  return NextResponse.json({ published: ids.length, posts: posts.map((p) => p.title) });
}
