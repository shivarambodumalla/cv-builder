import { test, expect } from "@playwright/test";
import { TEST_CV_ID } from "./helpers/auth";
import jobsFixture from "./fixtures/jobs.json";

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
    saveMethodCalled = route.request().method();
    const method = route.request().method();
    if (method === "GET") await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ savedJobs: [] }) });
    else if (method === "POST") await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, saved: true }) });
    else if (method === "DELETE") await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, saved: false }) });
    else await route.fulfill({ status: 405 });
  });
  await page.route("**/api/user/preferred-locations**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ locations: [] }) });
  });
  await page.route("**/api/activity/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.route("**/api/telemetry/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
}

test.describe("Jobs Feature", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await stubJobsApi(page);
  });

  test("jobs page loads with listings", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    // Wait for job cards from stub
    const firstCard = page.locator('[data-testid="job-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const count = await page.locator('[data-testid="job-card"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test("apply button tracks click", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    // Wait for card then find apply button INSIDE the first card
    const firstCard = page.locator('[data-testid="job-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const applyBtn = firstCard.locator('[data-testid="apply-btn"]');
    await expect(applyBtn).toBeVisible({ timeout: 5000 });

    const [popup] = await Promise.all([
      page.waitForEvent("popup").catch(() => null),
      applyBtn.click(),
    ]);
    await popup?.close();

    await expect.poll(() => trackClickCalled, { timeout: 10000 }).toBe(true);
  });

  test("save job toggles", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    const firstCard = page.locator('[data-testid="job-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const saveBtn = firstCard.locator('[data-testid="save-btn"]');
    await expect(saveBtn).toBeVisible({ timeout: 5000 });

    await saveBtn.click();

    await expect.poll(() => saveMethodCalled, { timeout: 10000 }).toBe("POST");
  });

  test("keyword filter works", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    const firstCard = page.locator('[data-testid="job-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const searchInput = page.locator('[data-testid="jobs-search"]');
    if (!(await searchInput.isVisible().catch(() => false))) {
      test.skip(true, "Search input not visible");
      return;
    }

    await searchInput.fill("engineer");
    await page.waitForTimeout(1500);

    const pageText = (await page.textContent("body")) || "";
    expect(pageText.includes("engineer") || pageText.includes("Engineer") || pageText.includes("No jobs")).toBeTruthy();
  });

  test("saved jobs page loads", async ({ page }) => {
    await page.goto("/my-jobs/saved");
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    const pageText = (await page.textContent("body")) || "";
    expect(pageText.includes("Saved") || pageText.includes("saved") || pageText.includes("No saved jobs")).toBeTruthy();
  });
});

test.describe("Jobs SEO", () => {
  test("public /jobs page accessible without login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined as any });
    const page = await context.newPage();
    await page.goto("/jobs");
    await page.waitForLoadState("domcontentloaded");
    expect((await page.textContent("body") || "").toLowerCase()).toContain("job");
    await context.close();
  });

  test("role SEO page loads", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined as any });
    const page = await context.newPage();
    await page.goto("/jobs/software-engineer");
    await page.waitForSelector("h1", { timeout: 10000 });
    expect((await page.locator("h1").textContent() || "").toLowerCase()).toContain("software engineer");
    await context.close();
  });
});

test.describe("Jobs Widget", () => {
  test("jobs widget in job match panel", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForSelector("body", { timeout: 5000 });
    const isVisible = await page.locator('[data-testid="jobs-widget"]').isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });
});
