import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { source_type, cv_id, source_url, file_content } = await request.json();
  let sourceContent = "";
  let userRole = "General";

  if (source_type === "cv_bullet" && cv_id) {
    const { data: cv } = await supabase
      .from("cvs")
      .select("parsed_json, target_role")
      .eq("id", cv_id)
      .eq("user_id", user.id)
      .single();
    if (!cv) return NextResponse.json({ error: "CV not found" }, { status: 404 });
    const parsed = cv.parsed_json as Record<string, unknown>;
    userRole = (cv.target_role as string) || "General";
    // Extract all bullets + summary
    const parts: string[] = [];
    const summary = (parsed?.summary as { content?: string })?.content;
    if (summary) parts.push(`Summary: ${summary}`);
    const experience = (parsed?.experience as { items?: { company: string; role: string; bullets: string[] }[] })?.items || [];
    for (const exp of experience) {
      parts.push(`\n${exp.role} at ${exp.company}:`);
      for (const b of exp.bullets || []) parts.push(`- ${b}`);
    }
    sourceContent = parts.join("\n");
  } else if (source_type === "url" || source_type === "github" || source_type === "portfolio") {
    if (!source_url) return NextResponse.json({ error: "URL required" }, { status: 400 });
    let fetchUrl = source_url;
    if (source_type === "github" && !source_url.includes("README")) {
      fetchUrl = source_url.replace(/\/$/, "") + "/raw/main/README.md";
    }
    try {
      const res = await fetch(fetchUrl, { headers: { "User-Agent": "CVEdge/1.0" } });
      sourceContent = (await res.text()).slice(0, 5000);
    } catch {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    }
  } else if (source_type === "pdf" && file_content) {
    sourceContent = file_content.slice(0, 5000);
  } else {
    return NextResponse.json({ error: "Invalid source_type" }, { status: 400 });
  }

  if (!sourceContent || sourceContent.length < 20) {
    return NextResponse.json({ error: "Not enough content to extract stories" }, { status: 400 });
  }

  try {
    const result = await callAI({
      promptName: "story_extract_v1",
      variables: { source_content: sourceContent, source_type, user_role: userRole },
      feature: "story_extract",
      userId: user.id,
      ip,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[story-extract] Failed:", err);
    return NextResponse.json({ stories: [] });
  }
}
