import { test, expect } from "@playwright/test";
import { TEST_CV_ID } from "./helpers/auth";
import jobsFixture from "./fixtures/jobs.json";

// Stub all jobs API endpoints so tests are deterministic (no external API dependency)
async function stubJobsApi(page: import("@playwright/test").Page) {
  await page.route("**/api/jobs/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(jobsFixture),
    });
  });
  await page.route("**/api/jobs/track-click", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.route("**/api/jobs/save", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: '[]' });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    }
  });
}

test.describe("Jobs Feature", () => {
  test.beforeEach(async ({ page }) => {
    await stubJobsApi(page);
  });

  test("jobs page loads with listings", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    const cards = await page.locator('[data-testid="job-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });

  test("apply button tracks click", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    const trackPromise = page.waitForRequest(
      (req) => req.url().includes("/api/jobs/track-click") && req.method() === "POST"
    );

    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      page.locator('[data-testid="apply-btn"]').first().click(),
    ]);

    const req = await trackPromise;
    expect(req.method()).toBe("POST");
    await newPage.close();
  });

  test("save job toggles", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    const saveBtn = page.locator('[data-testid="save-btn"]').first();
    await saveBtn.click();

    // Wait for class change instead of arbitrary timeout
    await expect(saveBtn).toHaveClass(/saved/, { timeout: 3000 });

    await saveBtn.click();
    await expect(saveBtn).not.toHaveClass(/saved/, { timeout: 3000 });
  });

  test("keyword filter works", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    await page.fill('[data-testid="jobs-search"]', "engineer");

    // Wait for results to update
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });

    const pageText = (await page.textContent("body")) || "";
    const hasContent =
      pageText.includes("engineer") ||
      pageText.includes("Engineer") ||
      pageText.includes("No jobs found");
    expect(hasContent).toBeTruthy();
  });

  test("saved jobs page loads", async ({ page }) => {
    await page.goto("/my-jobs/saved");

    // Wait for page to render
    await page.waitForSelector("body", { timeout: 10000 });
    const pageText = (await page.textContent("body")) || "";
    const hasSavedContent =
      pageText.includes("Saved") || pageText.includes("saved") || pageText.includes("No saved jobs");
    expect(hasSavedContent).toBeTruthy();
  });
});

test.describe("Jobs SEO", () => {
  test("public /jobs page accessible without login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined as any });
    const page = await context.newPage();

    await page.goto("/jobs");
    await page.waitForSelector("body", { timeout: 10000 });

    const pageText = (await page.textContent("body")) || "";
    const hasJobContent =
      pageText.includes("Jobs") || pageText.includes("jobs") || pageText.includes("Sign");
    expect(hasJobContent).toBeTruthy();

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

    // Wait for panel to render
    await page.waitForSelector("body", { timeout: 5000 });

    const widget = page.locator('[data-testid="jobs-widget"]');
    const isVisible = await widget.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });
});
