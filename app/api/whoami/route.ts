import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const signedInEmail = user?.email?.toLowerCase() || null;
  const isAdmin = signedInEmail ? adminEmails.includes(signedInEmail) : false;

  return NextResponse.json({
    signedIn: !!user,
    signedInEmail,
    adminEmailsConfigured: adminEmails.length,
    adminEmailsPreview: adminEmails.map((e) => {
      const [local, domain] = e.split("@");
      if (!domain) return e;
      return `${local.slice(0, 3)}***@${domain}`;
    }),
    isAdmin,
  });
}
