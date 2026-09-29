import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import { marked } from "marked";

type PostState = { slug: string; is_published: boolean };

/**
 * Tell caches and IndexNow about every public URL a write touched: the live
 * post, plus the old URL when a published post is renamed, unpublished or
 * deleted (IndexNow wants removals too, so the 404 gets picked up quickly).
 */
async function announceChange(before: PostState | null, after: PostState | null) {
  const paths = [before, after].flatMap((p) => (p?.is_published ? [`/blog/${p.slug}`] : []));
  if (!paths.length) return;
  paths.push("/blog");
  paths.forEach((p) => revalidatePath(p));
  await submitToIndexNow(paths);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createAdminClient();
  const { data, error } = await db.from("blog_posts").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const db = createAdminClient();

  const { data: before } = await db
    .from("blog_posts")
    .select("slug, is_published")
    .eq("id", id)
    .maybeSingle();

  // Posts authored directly in HTML (no markdown source) must survive an
  // admin save that only changes metadata such as the cover image.
  const contentHtml = body.content_md ? (marked(body.content_md) as string) : undefined;

  const { data, error } = await db
    .from("blog_posts")
    .update({
      slug: body.slug,
      title: body.title,
      brief: body.brief ?? "",
      content_md: body.content_md ?? "",
      ...(contentHtml !== undefined ? { content_html: contentHtml } : {}),
      cover_image_url: body.cover_image_url ?? null,
      tags: body.tags ?? [],
      seo_title: body.seo_title ?? body.title,
      seo_description: body.seo_description ?? body.brief ?? "",
      author_name: body.author_name ?? "CVEdge",
      read_time_minutes: body.read_time_minutes ?? 5,
      is_published: body.is_published ?? false,
      published_at: body.is_published ? (body.published_at ?? new Date().toISOString()) : null,
      scheduled_at: body.scheduled_at ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await announceChange(before, data);
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const db = createAdminClient();
  const { data: deleted, error } = await db
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .select("slug, is_published")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await announceChange(deleted, null);
  return NextResponse.json({ ok: true });
}
