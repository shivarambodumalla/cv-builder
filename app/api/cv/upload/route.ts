import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { structureCvText } from "@/lib/ai/gemini";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

async function extractText(
  buffer: Buffer,
  extension: string
): Promise<string> {
  if (extension === ".pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const pastedText = formData.get("text") as string | null;
  const title = (formData.get("title") as string) || "Untitled CV";

  let rawText = "";
  let fileBuffer: Buffer | null = null;
  let fileExtension = "";

  if (file) {
    fileExtension = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, and DOCX files are supported" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOC, and DOCX files are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
      rawText = await extractText(fileBuffer, fileExtension);
    } catch (err) {
      console.error("[cv/upload] File parse failed:", err);
      return NextResponse.json(
        { error: "Could not read this file. Try copy-pasting your CV instead" },
        { status: 422 }
      );
    }
  } else if (pastedText) {
    rawText = pastedText;
  } else {
    return NextResponse.json(
      { error: "Provide a file or paste text" },
      { status: 400 }
    );
  }

  if (!rawText.trim()) {
    return NextResponse.json(
      { error: "Could not read this file. Try copy-pasting your CV instead" },
      { status: 422 }
    );
  }

  let parsedJson = null;
  try {
    parsedJson = await structureCvText(rawText);
  } catch (err) {
    console.error("[cv/upload] AI structuring failed (non-blocking):", err);
  }

  const admin = createAdminClient();

  const { data: cv, error: insertError } = await admin
    .from("cvs")
    .insert({
      user_id: user.id,
      title,
      raw_text: rawText,
      ...(parsedJson ? { parsed_json: parsedJson } : {}),
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[cv/upload] Insert error:", insertError.message);
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  if (fileBuffer) {
    const ext = fileExtension || ".pdf";
    const filePath = `${user.id}/${cv.id}${ext}`;
    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    await admin.storage
      .from("cvs")
      .upload(filePath, fileBuffer, {
        contentType: mimeMap[ext] || "application/octet-stream",
        upsert: true,
      });
  }

  return NextResponse.json({ cv_id: cv.id });
}
