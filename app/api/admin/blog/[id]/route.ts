import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { marked } from "marked";

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

  const contentHtml = body.content_md ? (marked(body.content_md) as string) : "";

  const { data, error } = await db
    .from("blog_posts")
    .update({
      slug: body.slug,
      title: body.title,
      brief: body.brief ?? "",
      content_md: body.content_md ?? "",
      content_html: contentHtml,
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
  const { error } = await db.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
