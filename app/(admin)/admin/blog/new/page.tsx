import type { Metadata } from "next";
import { BlogEditorClient } from "@/components/admin/blog/blog-editor-client";

export const metadata: Metadata = { title: "New Post" };
export const dynamic = "force-dynamic";

export default function NewBlogPostPage() {
  return <BlogEditorClient />;
}
