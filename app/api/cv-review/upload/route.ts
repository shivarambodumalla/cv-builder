import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const reviewId = formData.get("review_id") as string;
  const file = formData.get("file") as File;

  if (!reviewId || !file) {
    return NextResponse.json({ error: "review_id and file are required" }, { status: 400 });
  }

  // Validate user owns this review
  const admin = createAdminClient();
  const { data: review } = await admin
    .from("cv_reviews")
    .select("id, status, edit_rounds_used, edit_rounds_limit, user_id")
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .single();

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  // Validate file
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const fileType = fileExt === "pdf" ? "pdf" : fileExt === "docx" ? "docx" : null;

  if (!fileType || !allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and DOCX files are accepted." }, { status: 400 });
  }

  // Get next version number
  const { data: existing } = await admin
    .from("cv_review_files")
    .select("version_number")
    .eq("review_id", reviewId)
    .eq("uploaded_by", "user")
    .order("version_number", { ascending: false })
    .limit(1);

  const versionNumber = (existing?.[0]?.version_number ?? 0) + 1;

  // Upload to Supabase storage
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const storagePath = `${reviewId}/v${versionNumber}_${file.name}`;

  const { error: uploadError } = await admin.storage
    .from("cv-review-files")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[cv-review/upload]", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from("cv-review-files").getPublicUrl(storagePath);

  // Insert file record
  await admin.from("cv_review_files").insert({
    review_id: reviewId,
    file_url: publicUrl,
    file_name: file.name,
    file_type: fileType,
    file_size_bytes: file.size,
    version_number: versionNumber,
    uploaded_by: "user",
  });

  // Transition to in_progress on first upload
  if (review.status === "pending") {
    await admin.from("cv_reviews").update({ status: "in_progress" }).eq("id", reviewId);
  }

  return NextResponse.json({ file_url: publicUrl, version_number: versionNumber });
}
