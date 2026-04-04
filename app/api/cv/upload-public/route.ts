import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { structureCvText } from "@/lib/ai/gemini";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;
    const role = formData.get("role") as string | null;
    const domain = (formData.get("domain") as string) || null;

    if (!role?.trim()) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    if (!file && !pastedText?.trim()) {
      return NextResponse.json({ error: "File or text is required" }, { status: 400 });
    }

    let rawText: string;
    let title = "Uploaded CV";

    if (file) {
      const ext = file.name.lastIndexOf(".") >= 0
        ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
        : "";

      if (ext !== ".pdf") {
        return NextResponse.json(
          { error: "Only PDF files are supported" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size must be under 5MB" },
          { status: 400 }
        );
      }

      title = file.name.replace(/\.pdf$/i, "");
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse/lib/pdf-parse");
        const parsed = await pdfParse(buffer);
        rawText = parsed.text;
      } catch (err) {
        console.error("[cv/upload-public] PDF parse failed:", err);
        return NextResponse.json(
          { error: "Could not read this PDF. Please try a different file." },
          { status: 422 }
        );
      }
    } else {
      rawText = pastedText!.trim();
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the provided input." },
        { status: 422 }
      );
    }

    let parsedJson = null;
    try {
      parsedJson = await structureCvText(rawText);
    } catch (err) {
      console.error("[cv/upload-public] Gemini structuring failed:", err);
    }

    const redirectToken = crypto.randomUUID();

    const admin = createAdminClient();

    const { data: cv, error: insertError } = await admin
      .from("cvs")
      .insert({
        user_id: null,
        title,
        raw_text: rawText,
        parsed_json: parsedJson,
        target_role: role.trim(),
        target_domain: domain?.trim() || null,
        redirect_token: redirectToken,
        status: "pending_auth",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[cv/upload-public] Insert error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to save CV. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      temp_cv_id: cv.id,
      redirect_token: redirectToken,
    });
  } catch (err) {
    console.error("[cv/upload-public] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
