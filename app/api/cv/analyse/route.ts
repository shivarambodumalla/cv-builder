import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyseCV } from "@/lib/ai/ats-analyser";
import { getDomainForRole } from "@/lib/resume/roles";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later.", retry_after: rl.retryAfter }, { status: 429 });
  }

  const { cv_id } = await request.json();

  if (!cv_id) {
    return NextResponse.json({ error: "cv_id is required" }, { status: 400 });
  }

  const { data: cv } = await supabase
    .from("cvs")
    .select("id")
    .eq("id", cv_id)
    .eq("user_id", user.id)
    .single();

  if (!cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  try {
    const report = await analyseCV(cv_id, { userId: user.id, ip });
    return NextResponse.json(report);
  } catch (err: unknown) {
    const error = err as Error & { code?: string; role?: string };

    if (error.code === "keyword_list_required") {
      const admin = createAdminClient();
      await admin.from("missing_roles").insert({
        role_name: error.role || "Unknown",
        domain: getDomainForRole(error.role || "") || null,
        user_id: user.id,
      });

      return NextResponse.json(
        {
          error: `No keyword list found for role: "${error.role}". We've recorded this request — keywords will be added soon.`,
          code: "keyword_list_required",
          role: error.role,
        },
        { status: 400 }
      );
    }

    console.error("[cv/analyse]", error.message);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 502 }
    );
  }
}
