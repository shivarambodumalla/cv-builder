const HASHNODE_API = "https://gql.hashnode.com";
const PUBLICATION_HOST = "blog.thecvedge.com";
const PAGE_SIZE = 50; // Hashnode's maximum per request

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

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(HASHNODE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Hashnode API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

type PostsPage<T> = {
  publication: { posts: { edges: { node: T }[]; pageInfo: PageInfo } } | null;
};

async function fetchAllPages<T>(
  nodeFragment: string,
  variables: Record<string, unknown> = {}
): Promise<T[]> {
  const results: T[] = [];
  let cursor: string | null = null;

  do {
    const data: PostsPage<T> = await gql<PostsPage<T>>(
      `query GetPage($host: String!, $first: Int!, $after: String) {
        publication(host: $host) {
          posts(first: $first, after: $after) {
            edges { node { ${nodeFragment} } }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { host: PUBLICATION_HOST, first: PAGE_SIZE, after: cursor, ...variables }
    );

    const page: { edges: { node: T }[]; pageInfo: PageInfo } | undefined =
      data.publication?.posts;
    if (!page) break;

    results.push(...page.edges.map((e: { node: T }) => e.node));
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor !== null);

  return results;
}

export interface PostsResult {
  posts: BlogPost[];
  hasMore: boolean;
  cursor: string | null;
}

export async function getPosts(after?: string | null): Promise<PostsResult> {
  const data = await gql<PostsPage<BlogPost>>(
    `query GetPosts($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        posts(first: $first, after: $after) {
          edges {
            node {
              id title slug brief publishedAt readTimeInMinutes
              coverImage { url }
              tags { name slug }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`,
    { host: PUBLICATION_HOST, first: PAGE_SIZE, after: after ?? null }
  );
  const page = data.publication?.posts;
  return {
    posts: page?.edges.map((e: { node: BlogPost }) => e.node) ?? [],
    hasMore: page?.pageInfo.hasNextPage ?? false,
    cursor: page?.pageInfo.endCursor ?? null,
  };
}

export async function getPost(slug: string): Promise<BlogPostFull | null> {
  const data = await gql<{ publication: { post: BlogPostFull | null } | null }>(
    `query GetPost($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          id title slug brief publishedAt updatedAt readTimeInMinutes
          coverImage { url }
          tags { name slug }
          content { html }
          seo { title description }
          author { name profilePicture }
        }
      }
    }`,
    { host: PUBLICATION_HOST, slug }
  );
  return data.publication?.post ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await fetchAllPages<{ slug: string }>("slug");
  return posts.map((p) => p.slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
