import { chromium } from "@playwright/test";

async function globalSetup() {
  const baseURL = "http://localhost:3000";

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Step 1: Call the test-auth API route to get a valid session cookie
  console.log("[test-setup] Calling /api/test-auth...");
  const response = await page.goto(`${baseURL}/api/test-auth`);

  if (!response || response.status() !== 200) {
    const text = await response?.text().catch(() => "no body");
    await browser.close();
    throw new Error(`Test auth failed (${response?.status()}): ${text}`);
  }

  const body = await response.json();
  console.log(`[test-setup] Auth OK — user: ${body.user_id}, cookie: ${body.cookie_name}`);

  // Step 2: Navigate to a protected page to verify the session works
  console.log("[test-setup] Verifying session on /dashboard...");
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForLoadState("domcontentloaded");

  const finalUrl = page.url();
  const isOnDashboard = finalUrl.includes("/dashboard");
  console.log(`[test-setup] Final URL: ${finalUrl} (dashboard: ${isOnDashboard})`);

  if (!isOnDashboard) {
    await browser.close();
    throw new Error(`Session not working — redirected to: ${finalUrl}`);
  }

  // Step 3: Save storage state (cookies + localStorage)
  await context.storageState({ path: "tests/e2e/.auth/user.json" });

  const cookies = await context.cookies();
  console.log(`[test-setup] Cookies: ${cookies.map((c) => c.name).join(", ")}`);

  await browser.close();
  console.log("[test-setup] ✓ Auth session saved");
}

export default globalSetup;
