import type { Metadata } from "next";
import { BlogEditorClient } from "@/components/admin/blog/blog-editor-client";

export const metadata: Metadata = { title: "Edit Post | CVEdge Admin" };
export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditorClient postId={id} />;
}
