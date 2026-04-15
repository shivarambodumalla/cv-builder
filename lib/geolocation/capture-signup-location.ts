import { createAdminClient } from "@/lib/supabase/admin";

interface IpLookupResult {
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  success?: boolean;
}

function pickIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || null;
}

async function lookupIp(ip: string): Promise<IpLookupResult | null> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success === false) return null;
    return {
      city: json.city,
      region: json.region,
      country: json.country,
      country_code: json.country_code,
      success: true,
    };
  } catch {
    return null;
  }
}

// Fire-and-forget: captures IP-derived location on first sign-in only (skipped if already set).
export async function captureSignupLocation(userId: string, headers: Headers): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("signup_location_captured_at")
      .eq("id", userId)
      .single();
    if (existing?.signup_location_captured_at) return;

    const ip = pickIp(headers);
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      // Mark as captured to avoid retrying for every request from a local dev session.
      await admin
        .from("profiles")
        .update({ signup_location_captured_at: new Date().toISOString(), signup_ip: ip })
        .eq("id", userId);
      return;
    }

    const loc = await lookupIp(ip);
    await admin
      .from("profiles")
      .update({
        signup_city: loc?.city ?? null,
        signup_region: loc?.region ?? null,
        signup_country: loc?.country ?? null,
        signup_country_code: loc?.country_code ?? null,
        signup_ip: ip,
        signup_location_captured_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch {
    // Silent — don't ever break auth flow.
  }
}
