import type { Metadata } from "next";
import { BlogPostsClient } from "@/components/admin/blog/blog-posts-client";

export const metadata: Metadata = { title: "Blog | CVEdge Admin" };
export const dynamic = "force-dynamic";

export default function AdminBlogPage() {
  return <BlogPostsClient />;
}
