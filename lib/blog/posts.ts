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
      title: (row.seo_title as string) ?? null,
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

export async function getAllPostsForSitemap(): Promise<{ slug: string; published_at: string }[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("slug, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as { slug: string; published_at: string }[];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
