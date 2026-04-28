"use server";

import { getPosts, type PostsResult } from "@/lib/blog/hashnode";

export async function loadMorePosts(cursor: string): Promise<PostsResult> {
  return getPosts(cursor);
}
