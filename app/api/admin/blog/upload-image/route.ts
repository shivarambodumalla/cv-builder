import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const slug = (form.get("slug") as string | null) ?? crypto.randomUUID();

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `blog-covers/${slug}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const db = createAdminClient();
  const { error } = await db.storage
    .from("blog-images")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // The path is reused when a cover is replaced, and the image optimizer caches
  // by URL for 31 days (images.minimumCacheTTL), so each upload gets a new URL.
  const { data } = db.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ url: `${data.publicUrl}?v=${Date.now()}` });
}
