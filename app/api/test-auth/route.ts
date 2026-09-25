import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

/**
 * Test-only auth endpoint.
 * Creates a real Supabase session for the test user and sets
 * cookies in the correct @supabase/ssr chunked format.
 *
 * Only works when ENABLE_TEST_AUTH=true and NOT in production.
 */
export async function GET() {
  // Only available when ENABLE_TEST_AUTH is explicitly set to "true"
  // In production deployments, this env var is never set
  if (process.env.ENABLE_TEST_AUTH !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const testEmail = "test@cvedge.test";
  const testPassword = "TestPassword123!";

  // Step 1: Sign in directly. Only fall back to creating or resetting the
  // account when that fails — listUsers() is paged (50 per page), so scanning
  // it first misses the test user on any database with more than 50 accounts
  // and the subsequent createUser() fails with "already registered".
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const signIn = () =>
    anonClient.auth.signInWithPassword({ email: testEmail, password: testPassword });

  let { data: signInData, error: signInError } = await signIn();

  if (signInError || !signInData.session) {
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error: createError } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: "Arjun Mehta" },
    });

    if (createError) {
      // Account exists with a different password: find it across pages and reset.
      let userId: string | undefined;
      for (let page = 1; page <= 50 && !userId; page++) {
        const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (!data?.users?.length) break;
        userId = data.users.find((u) => u.email === testEmail)?.id;
      }
      if (!userId) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      const { error: resetError } = await admin.auth.admin.updateUserById(userId, {
        password: testPassword,
        email_confirm: true,
      });
      if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 });
    }

    ({ data: signInData, error: signInError } = await signIn());
  }

  if (signInError || !signInData.session) {
    return NextResponse.json({ error: `Sign in failed: ${signInError?.message}` }, { status: 500 });
  }

  // Step 3: Use @supabase/ssr createServerClient to set cookies
  // in the correct chunked format that the middleware expects
  const response = NextResponse.json({
    ok: true,
    user_id: signInData.user.id,
  });

  const supabaseSsr = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            path: "/",
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60,
          });
        });
      },
    },
  });

  // This call triggers setAll with the properly chunked cookies
  await supabaseSsr.auth.setSession({
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
  });

  return response;
}
