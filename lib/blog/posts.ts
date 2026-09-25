import { createAdminClient } from "@/lib/supabase/admin";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  brief: string;
  publishedAt: string;
  readTimeInMinutes: number;
  coverImage: { url: string } | null;
  tags: { name: string; slug: string }[];
}

export interface BlogPostFull extends BlogPost {
  content: { html: string };
  updatedAt: string;
  seo: { title: string | null; description: string | null } | null;
  author: { name: string; profilePicture: string | null } | null;
}

export interface PostsResult {
  posts: BlogPost[];
  hasMore: boolean;
  cursor: string | null;
}

const PAGE_SIZE = 50;

function stripBrandSuffix(title: string | null | undefined): string | null {
  if (!title) return null;
  return title.replace(/\s*[|\u2014\u2013-]\s*CVEdge\s*$/i, "").trim() || null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pull question/answer pairs out of a post's FAQ block so the page can emit
 * FAQPage structured data. Convention (see scripts/blog-us-aeo-refresh.ts): an
 * `<h2>` whose text contains "FAQ" or "Frequently asked", followed by
 * `<h3>question</h3>` + one or more `<p>` answer paragraphs, up to the next
 * `<h2>`. Posts without such a block simply get no FAQ schema.
 */
export function extractFaq(html: string): FaqItem[] {
  const block = html.match(
    /<h2[^>]*>[^<]*(?:\bFAQs?\b|frequently asked)[^<]*<\/h2>([\s\S]*?)(?=<h2[\s>]|$)/i
  );
  if (!block) return [];
  const items: FaqItem[] = [];
  const pair = /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*)+)/gi;
  let m: RegExpExecArray | null;
  while ((m = pair.exec(block[1])) !== null) {
    const question = htmlToText(m[1]);
    const answer = htmlToText(m[2]);
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

function rowToPost(row: Record<string, unknown>): BlogPost {
  const tags = (row.tags as string[] | null) ?? [];
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    brief: (row.brief as string) ?? "",
    publishedAt: row.published_at as string,
    readTimeInMinutes: (row.read_time_minutes as number) ?? 5,
    coverImage: row.cover_image_url ? { url: row.cover_image_url as string } : null,
    tags: tags.map((t) => ({ name: t, slug: t.toLowerCase().replace(/\s+/g, "-") })),
  };
}

function rowToPostFull(row: Record<string, unknown>): BlogPostFull {
  return {
    ...rowToPost(row),
    content: { html: (row.content_html as string) ?? "" },
    updatedAt: (row.updated_at as string) ?? (row.published_at as string),
    seo: {
      // The root layout's title template already appends " | CVEdge"; a stored
      // title carrying its own suffix would render "… | CVEdge | CVEdge".
      title: stripBrandSuffix(row.seo_title as string | null),
      description: (row.seo_description as string) ?? null,
    },
    author: {
      name: (row.author_name as string) ?? "CVEdge",
      profilePicture: null,
    },
  };
}

export async function getPosts(after?: string | null): Promise<PostsResult> {
  const db = createAdminClient();
  let query = db
    .from("blog_posts")
    .select("id, slug, title, brief, published_at, read_time_minutes, cover_image_url, tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (after) {
    query = query.lt("published_at", after);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const posts = (data ?? []).map(rowToPost);
  const hasMore = posts.length === PAGE_SIZE;
  const cursor = hasMore ? posts[posts.length - 1].publishedAt : null;

  return { posts, hasMore, cursor };
}

export async function getPost(slug: string): Promise<BlogPostFull | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return rowToPostFull(data as Record<string, unknown>);
}

export async function getAllSlugs(): Promise<string[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.slug as string);
}

export async function getAllPostsForSitemap(): Promise<
  { slug: string; published_at: string; updated_at: string | null }[]
> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("slug, published_at, updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as { slug: string; published_at: string; updated_at: string | null }[];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
