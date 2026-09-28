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
  const post = rowToPostFull(data as Record<string, unknown>);
  post.content.html = await unlinkScheduledPosts(post.content.html);
  return post;
}

const BLOG_LINK_RE = /<a\s[^>]*href="(?:https:\/\/www\.thecvedge\.com)?\/blog\/([a-z0-9-]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

/**
 * Drafts cross-link sister posts that publish on later dates. Render those
 * links as plain text until the target goes live, so readers and crawlers
 * never hit a 404. The page's hourly revalidate restores the link afterwards.
 */
async function unlinkScheduledPosts(html: string): Promise<string> {
  const slugs = Array.from(new Set(Array.from(html.matchAll(BLOG_LINK_RE), (m) => m[1])));
  if (slugs.length === 0) return html;

  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("slug")
    .in("slug", slugs)
    .eq("is_published", false)
    .not("scheduled_at", "is", null);
  if (error) throw new Error(error.message);

  const pending = new Set((data ?? []).map((r) => r.slug as string));
  if (pending.size === 0) return html;
  return html.replace(BLOG_LINK_RE, (anchor, slug: string, text: string) =>
    pending.has(slug) ? text : anchor
  );
}

// Filler words that are rare enough in slugs to score highly under IDF while
// saying nothing about the topic ("how-much-does…" vs "…how-does-it-work").
const SLUG_STOPWORDS = new Set([
  "a", "an", "and", "the", "to", "for", "of", "in", "on", "vs", "is", "it", "s", "re",
  "how", "what", "why", "does", "do", "much", "not", "get", "can", "need", "that", "with",
  "by", "your", "you", "actually", "really", "best", "work", "cost", "guide",
]);

const slugTokens = (slug: string) =>
  new Set(slug.split("-").filter((t) => t && !SLUG_STOPWORDS.has(t) && !/^\d+$/.test(t)));

// Gulf posts serve a different job market; mixing them into US or European
// reading lists (and vice versa) matches words, not readers.
const REGIONAL_TAG = "Gulf Careers";
const isRegional = (p: BlogPost) => p.tags.some((t) => t.name === REGIONAL_TAG);

/**
 * Rank sister posts by shared tags and shared slug words, each weighted by
 * rarity (IDF): sharing "Gulf Careers" says far more than sharing "Resume
 * Writing", which half the blog carries. A candidate needs at least one shared
 * tag; slug words only reorder within that. Ties go to the newer post, and a
 * post with too few matches is topped up with the latest articles.
 */
export function rankRelatedPosts(current: BlogPost, pool: BlogPost[], limit = 3): BlogPost[] {
  const others = pool.filter(
    (p) => p.slug !== current.slug && isRegional(p) === isRegional(current)
  );
  const docs = [current, ...others].map((p) => ({
    tags: new Set(p.tags.map((t) => t.name)),
    words: slugTokens(p.slug),
  }));
  const df = new Map<string, number>();
  for (const d of docs) {
    for (const t of d.tags) df.set(`t:${t}`, (df.get(`t:${t}`) ?? 0) + 1);
    for (const w of d.words) df.set(`w:${w}`, (df.get(`w:${w}`) ?? 0) + 1);
  }
  const idf = (key: string) => Math.log(docs.length / (df.get(key) ?? docs.length));

  const [self, ...rest] = docs;
  const scored = others.map((post, i) => {
    let tagScore = 0;
    let wordScore = 0;
    for (const t of rest[i].tags) if (self.tags.has(t)) tagScore += idf(`t:${t}`);
    for (const w of rest[i].words) if (self.words.has(w)) wordScore += idf(`w:${w}`);
    return { post, score: tagScore > 0 ? tagScore + wordScore / 2 : 0 };
  });

  return scored
    .sort((a, b) => b.score - a.score || b.post.publishedAt.localeCompare(a.post.publishedAt))
    .slice(0, limit)
    .map((s) => s.post);
}

export async function getRelatedPosts(current: BlogPost, limit = 3): Promise<BlogPost[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("id, slug, title, brief, published_at, read_time_minutes, cover_image_url, tags")
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  return rankRelatedPosts(current, (data ?? []).map(rowToPost), limit);
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
