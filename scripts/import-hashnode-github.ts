/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * One-time import script: fetches all Hashnode blog posts from GitHub backup,
 * migrates cover images to Supabase Storage, and inserts into blog_posts table.
 *
 * Usage: npx tsx scripts/import-hashnode-github.ts
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const matter = require("gray-matter");
const { marked } = require("marked");

const GITHUB_RAW =
  "https://raw.githubusercontent.com/shivarambodumalla/one/main";
const GITHUB_API =
  "https://api.github.com/repos/shivarambodumalla/one/contents";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Estimate reading time (avg 200 words/min)
function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Parse tags — Hashnode exports as comma-separated slug strings
function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return String(raw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Download a cover image from Hashnode CDN and upload to Supabase Storage.
// Returns the public Supabase URL, or the original URL on failure.
async function migrateCoverImage(
  url: string,
  slug: string
): Promise<string> {
  if (!url) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = url.split("?")[0].split(".").pop() ?? "jpg";
    const path = `blog-covers/${slug}.${ext}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, buffer, {
        contentType: res.headers.get("content-type") ?? "image/jpeg",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    console.log(`  ✓ image uploaded: ${path}`);
    return data.publicUrl;
  } catch (err) {
    console.warn(`  ⚠ image migration failed for ${slug}, keeping original URL:`, err);
    return url;
  }
}

async function main() {
  // 1. Fetch file list from GitHub
  const listRes = await fetch(GITHUB_API);
  const files: { name: string; type: string }[] = await listRes.json();
  const mdFiles = files.filter(
    (f) =>
      f.type === "file" &&
      f.name.endsWith(".md") &&
      f.name !== "README.md" &&
      f.name !== "README.old.md"
  );

  console.log(`Found ${mdFiles.length} posts to import\n`);

  let imported = 0;
  let skipped = 0;

  for (const file of mdFiles) {
    const raw = await fetch(`${GITHUB_RAW}/${file.name}`).then((r) => r.text());
    const { data: fm, content } = matter(raw);

    const slug: string = fm.slug ?? file.name.replace(".md", "");
    const title: string = fm.title ?? "Untitled";
    const brief: string = fm.subtitle ?? fm.brief ?? "";
    const seoTitle: string = fm.seoTitle ?? title;
    const seoDescription: string = fm.seoDescription ?? brief;
    const tags = parseTags(fm.tags);
    const publishedAt: string = fm.datePublished ?? new Date().toISOString();

    console.log(`Importing: ${title}`);

    const coverImageUrl = await migrateCoverImage(fm.cover ?? "", slug);
    const contentHtml = marked(content) as string;
    const readTime = readingTime(content);

    const { error } = await supabase.from("blog_posts").upsert(
      {
        slug,
        title,
        brief,
        content_md: content,
        content_html: contentHtml,
        cover_image_url: coverImageUrl || null,
        tags,
        seo_title: seoTitle,
        seo_description: seoDescription,
        author_name: "CVEdge",
        read_time_minutes: readTime,
        is_published: true,
        published_at: publishedAt,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`  ✗ failed: ${error.message}`);
      skipped++;
    } else {
      console.log(`  ✓ imported\n`);
      imported++;
    }
  }

  console.log(`\nDone. ${imported} imported, ${skipped} failed.`);
}

main().catch(console.error);
