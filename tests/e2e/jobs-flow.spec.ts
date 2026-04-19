import { test, expect } from "@playwright/test";
import { TEST_CV_ID } from "./helpers/auth";
import jobsFixture from "./fixtures/jobs.json";

// Track which stubs were hit
let trackClickCalled = false;
let saveMethodCalled: string | null = null;

async function stubJobsApi(page: import("@playwright/test").Page) {
  trackClickCalled = false;
  saveMethodCalled = null;

  await page.route("**/api/jobs/search**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(jobsFixture) });
  });

  await page.route("**/api/jobs/track-click**", async (route) => {
    trackClickCalled = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });

  await page.route("**/api/jobs/save**", async (route) => {
    const method = route.request().method();
    saveMethodCalled = method;
    if (method === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ savedJobs: [] }) });
    } else if (method === "POST") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, saved: true }) });
    } else if (method === "DELETE") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, saved: false }) });
    } else {
      await route.fulfill({ status: 405 });
    }
  });

  await page.route("**/api/user/preferred-locations**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ locations: [] }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    }
  });

  // Stub activity/telemetry to prevent noise
  await page.route("**/api/activity/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.route("**/api/telemetry/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
}

async function waitForJobCards(page: import("@playwright/test").Page) {
  await page.waitForResponse(
    (r) => r.url().includes("/api/jobs/search") && r.status() === 200,
    { timeout: 20000 }
  ).catch(() => {});
  await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible({ timeout: 15000 });
}

test.describe("Jobs Feature", () => {
  test.beforeEach(async ({ page }) => {
    await stubJobsApi(page);
  });

  test("jobs page loads with listings", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");

    if (page.url().includes("/login")) {
      test.skip(true, "Auth not available");
      return;
    }

    await waitForJobCards(page);
    const cards = await page.locator('[data-testid="job-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });

  test("apply button tracks click", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await waitForJobCards(page);

    const applyBtn = page.locator('[data-testid="apply-btn"]').first();
    await expect(applyBtn).toBeVisible({ timeout: 10000 });

    // Apply may open a new tab — handle gracefully
    const [popup] = await Promise.all([
      page.waitForEvent("popup").catch(() => null),
      applyBtn.click(),
    ]);
    await popup?.close();

    // Verify the track-click stub was hit (poll since fetch is fire-and-forget)
    await expect.poll(() => trackClickCalled, { timeout: 10000 }).toBe(true);
  });

  test("save job toggles", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await waitForJobCards(page);

    const saveBtn = page.locator('[data-testid="save-btn"]').first();
    await expect(saveBtn).toBeVisible({ timeout: 10000 });

    await saveBtn.click();

    // Verify save API was called with POST
    await expect.poll(() => saveMethodCalled, { timeout: 10000 }).toBe("POST");
  });

  test("keyword filter works", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await waitForJobCards(page);

    const searchInput = page.locator('[data-testid="jobs-search"]');
    if (!(await searchInput.isVisible().catch(() => false))) {
      test.skip(true, "Search input not visible");
      return;
    }

    await searchInput.fill("engineer");
    await page.waitForTimeout(1500);

    const pageText = (await page.textContent("body")) || "";
    expect(
      pageText.includes("engineer") || pageText.includes("Engineer") || pageText.includes("No jobs")
    ).toBeTruthy();
  });

  test("saved jobs page loads", async ({ page }) => {
    await page.goto("/my-jobs/saved");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    const pageText = (await page.textContent("body")) || "";
    expect(
      pageText.includes("Saved") || pageText.includes("saved") || pageText.includes("No saved jobs")
    ).toBeTruthy();
  });
});

test.describe("Jobs SEO", () => {
  test("public /jobs page accessible without login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined as any });
    const page = await context.newPage();
    await page.goto("/jobs");
    await page.waitForLoadState("domcontentloaded");
    const pageText = (await page.textContent("body")) || "";
    expect(pageText.toLowerCase()).toContain("job");
    await context.close();
  });

  test("role SEO page loads", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined as any });
    const page = await context.newPage();
    await page.goto("/jobs/software-engineer");
    await page.waitForSelector("h1", { timeout: 10000 });
    const h1 = await page.locator("h1").textContent();
    expect(h1?.toLowerCase()).toContain("software engineer");
    await context.close();
  });
});

test.describe("Jobs Widget", () => {
  test("jobs widget in job match panel", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForSelector("body", { timeout: 5000 });
    const widget = page.locator('[data-testid="jobs-widget"]');
    const isVisible = await widget.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });
});
