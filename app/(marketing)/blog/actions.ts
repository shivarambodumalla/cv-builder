"use server";

import { getPosts, type PostsResult } from "@/lib/blog/posts";

export async function loadMorePosts(cursor: string): Promise<PostsResult> {
  return getPosts(cursor);
}
