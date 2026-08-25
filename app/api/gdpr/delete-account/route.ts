import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GDPR account erasure.
 *
 * Order matters here. profiles.id cascades off auth.users, so anything written
 * to profiles is destroyed by deleteUser(). The audit trail is therefore written
 * to account_deletions (no FK, survives the cascade) BEFORE any erasure begins,
 * and erasure is aborted if that write fails — we never erase without a trail.
 *
 * An active subscription is cancelled upstream first. Without this, a user can
 * delete their account and keep being charged forever with no profile to point
 * the payment at.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const userId = user.id;

  try {
    // 1. Capture billing state before anything is destroyed.
    const { data: profile } = await admin
      .from("profiles")
      .select("email, user_number, created_at, plan, subscription_status, subscription_id, subscription_period, current_period_end")
      .eq("id", userId)
      .maybeSingle();

    // 2. Cancel the upstream subscription so we stop charging a deleted account.
    const hasLiveSubscription =
      profile?.subscription_status === "active" && !!profile.subscription_id;
    let subscriptionCancelled = false;
    let cancelError: string | null = null;

    if (hasLiveSubscription) {
      try {
        const { cancelSubscription } = await import("@lemonsqueezy/lemonsqueezy.js");
        const { configureLemonSqueezy } = await import("@/lib/lemonsqueezy");
        configureLemonSqueezy();
        const { error } = await cancelSubscription(profile.subscription_id!);
        if (error) throw new Error(error.message);
        subscriptionCancelled = true;
      } catch (err) {
        // Do not abort: the user is entitled to erasure regardless. Record the
        // failure so the subscription can be cancelled by hand.
        cancelError = err instanceof Error ? err.message : String(err);
        console.error("[gdpr/delete-account] LS cancel failed:", cancelError);
      }
    }

    // 3. Write the audit row. Email is retained only where money was involved,
    //    so an orphaned payment can still be reconciled and refunded.
    const { error: auditError } = await admin.from("account_deletions").upsert({
      user_id: userId,
      user_number: profile?.user_number ?? null,
      signed_up_at: profile?.created_at ?? null,
      deleted_at: new Date().toISOString(),
      deleted_by: "user",
      plan: profile?.plan ?? null,
      subscription_status: profile?.subscription_status ?? null,
      subscription_id: profile?.subscription_id ?? null,
      subscription_period: profile?.subscription_period ?? null,
      current_period_end: profile?.current_period_end ?? null,
      subscription_cancelled: subscriptionCancelled,
      cancel_error: cancelError,
      email: profile?.subscription_id ? profile.email : null,
    }, { onConflict: "user_id" });

    if (auditError) {
      console.error("[gdpr/delete-account] audit write failed:", auditError);
      return NextResponse.json(
        { error: "Deletion failed. Please contact support." },
        { status: 500 }
      );
    }

    // 4. Erase personal data.
    await admin.from("cvs").delete().eq("user_id", userId);
    await admin.from("stories").delete().eq("user_id", userId);
    await admin.from("story_sources").delete().eq("user_id", userId);
    await admin.from("email_logs").delete().eq("user_id", userId);
    await admin.from("ai_usage_logs").delete().eq("user_id", userId);
    await admin.from("user_activity").delete().eq("user_id", userId);
    await admin.from("guarantee_claims").delete().eq("user_id", userId);
    await admin.from("subscription_history").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);

    // 5. Delete the auth user (signs them out everywhere).
    await admin.auth.admin.deleteUser(userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[gdpr/delete-account]", err);
    return NextResponse.json({ error: "Deletion failed. Please contact support." }, { status: 500 });
  }
}
