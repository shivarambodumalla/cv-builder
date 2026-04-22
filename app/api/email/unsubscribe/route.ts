import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  columnForType,
  isValidEmailType,
  verifyUnsubscribeToken,
  type EmailType,
} from "@/lib/email/unsubscribe-token";

export const dynamic = "force-dynamic";

// Shared handler for GET (click) and POST (List-Unsubscribe=One-Click)
async function unsubscribe(userId: string | null, email: string | null, type: EmailType) {
  const admin = createAdminClient();
  const column = columnForType(type);

  if (userId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.email) {
      await admin.from("profiles").update({ [column]: false }).eq("id", userId);
      return { ok: true, email: profile.email };
    }
  }

  // No userId path (waitlist-style) — add to suppression by email
  if (email) {
    await admin
      .from("email_suppressions")
      .upsert(
        { email: email.toLowerCase(), reason: "unsubscribe", source: type },
        { onConflict: "email" }
      );
    return { ok: true, email };
  }

  return { ok: false, error: "Missing identity" };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type") || "";
  const uid = params.get("uid");
  const token = params.get("t");
  const emailParam = params.get("email");

  if (!isValidEmailType(type)) {
    return NextResponse.redirect(new URL("/unsubscribe?status=error", request.url));
  }

  if (uid && token && !verifyUnsubscribeToken(uid, type, token)) {
    return NextResponse.redirect(new URL("/unsubscribe?status=invalid", request.url));
  }

  const result = await unsubscribe(uid, emailParam, type);
  const status = result.ok ? "ok" : "error";
  const url = new URL(`/unsubscribe?status=${status}&type=${type}`, request.url);
  if (result.ok && result.email) url.searchParams.set("email", result.email);
  return NextResponse.redirect(url);
}

// List-Unsubscribe=One-Click (RFC 8058) — mail clients POST here
export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type") || "";
  const uid = params.get("uid");
  const token = params.get("t");
  const emailParam = params.get("email");

  if (!isValidEmailType(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (uid && token && !verifyUnsubscribeToken(uid, type, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const result = await unsubscribe(uid, emailParam, type);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
