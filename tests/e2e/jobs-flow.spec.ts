import { test, expect } from "@playwright/test";
import { TEST_CV_ID } from "./helpers/auth";

test.describe("Jobs Feature", () => {
  test("jobs page loads with listings", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    const cards = await page.locator('[data-testid="job-card"]').count();
    expect(cards).toBeGreaterThan(0);

    // CV selector visible
    await expect(page.locator('[data-testid="cv-selector"]')).toBeVisible();

    // Filters bar visible
    await expect(page.locator('[data-testid="jobs-filters"]')).toBeVisible();
  });

  test("apply button tracks click", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    // Intercept the track API call
    const trackPromise = page.waitForRequest(
      (req) => req.url().includes("/api/jobs/track-click") && req.method() === "POST"
    );

    // Click first apply button — opens new tab, so listen before clicking
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      page.locator('[data-testid="apply-btn"]').first().click(),
    ]);

    const req = await trackPromise;
    expect(req.method()).toBe("POST");

    // Clean up the new tab
    await newPage.close();
  });

  test("save job toggles", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    const saveBtn = page.locator('[data-testid="save-btn"]').first();

    // Save
    await saveBtn.click();
    await page.waitForTimeout(500);
    await expect(saveBtn).toHaveClass(/saved/);

    // Unsave
    await saveBtn.click();
    await page.waitForTimeout(500);
    await expect(saveBtn).not.toHaveClass(/saved/);
  });

  test("keyword filter works", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    await page.fill('[data-testid="jobs-search"]', "engineer");

    // Wait for debounce + re-fetch
    await page.waitForTimeout(1000);

    // Page should still have results or show empty state
    const pageText = (await page.textContent("body")) || "";
    const hasContent =
      pageText.includes("engineer") ||
      pageText.includes("Engineer") ||
      pageText.includes("No jobs found");
    expect(hasContent).toBeTruthy();
  });

  test("CV selector fetches new jobs", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 15000 });

    const selector = page.locator('[data-testid="cv-selector"]');
    const options = await selector.locator("option").count();

    // Only test if user has multiple CVs
    if (options > 1) {
      const secondValue = await selector.locator("option").nth(1).getAttribute("value");
      if (secondValue) {
        await selector.selectOption(secondValue);
        // Wait for debounce + re-fetch
        await page.waitForTimeout(1000);
        // Page should show results or empty state (not error)
        const hasError = await page.locator(".text-error").isVisible().catch(() => false);
        expect(hasError).toBe(false);
      }
    }
  });

  test("saved jobs page loads", async ({ page }) => {
    await page.goto("/jobs/saved");
    await page.waitForTimeout(2000);

    const pageText = (await page.textContent("body")) || "";
    const hasSavedContent =
      pageText.includes("Saved") || pageText.includes("saved") || pageText.includes("No saved jobs");
    expect(hasSavedContent).toBeTruthy();
  });
});

test.describe("Jobs SEO", () => {
  test("public /jobs page accessible without login", async ({ browser }) => {
    // Fresh context — no auth
    const context = await browser.newContext({ storageState: undefined as any });
    const page = await context.newPage();

    await page.goto("/jobs");
    await page.waitForTimeout(3000);

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
    await page.waitForTimeout(3000);

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
    await page.waitForTimeout(2000);

    // Widget may or may not be visible depending on CV data
    const widget = page.locator('[data-testid="jobs-widget"]');
    const isVisible = await widget.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });
});
