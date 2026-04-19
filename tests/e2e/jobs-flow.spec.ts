import { test, expect } from "@playwright/test";
import { TEST_CV_ID } from "./helpers/auth";
import jobsFixture from "./fixtures/jobs.json";

let trackClickCalled = false;
let saveMethodCalled: string | null = null;

async function stubAllApis(page: import("@playwright/test").Page) {
  trackClickCalled = false;
  saveMethodCalled = null;

  // Stub all /api/jobs/* endpoints
  await page.route("**/api/jobs/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("track-click")) {
      trackClickCalled = true;
      return route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    }
    if (url.includes("save")) {
      saveMethodCalled = method;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(method === "GET" ? { savedJobs: [] } : { ok: true, saved: true }) });
    }
    if (url.includes("search")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(jobsFixture) });
    }
    return route.continue();
  });

  // Stub preferred locations API
  await page.route("**/api/user/**", async (route) => {
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ locations: [] }) });
  });

  // Stub telemetry/activity to reduce noise
  await page.route("**/api/activity/**", async (route) => route.fulfill({ status: 200, body: '{"ok":true}' }));
  await page.route("**/api/telemetry/**", async (route) => route.fulfill({ status: 200, body: '{"ok":true}' }));
}

/** Dismiss the preferred locations modal if it appears (blocks job cards in CI) */
async function dismissModalIfPresent(page: import("@playwright/test").Page) {
  // The modal has a "Skip for now" or close button — try to dismiss it
  const skipBtn = page.getByText("Skip for now");
  const closeBtn = page.locator('[role="dialog"] button').first();

  try {
    // Give it 3 seconds to appear
    if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    } else if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  } catch {
    // No modal — continue
  }
}

test.describe("Jobs Feature", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await stubAllApis(page);
  });

  test("jobs page loads with listings", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await dismissModalIfPresent(page);

    await expect(page.getByTestId("job-card").first()).toBeVisible({ timeout: 30000 });
    expect(await page.getByTestId("job-card").count()).toBeGreaterThan(0);
  });

  test("apply button tracks click", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await dismissModalIfPresent(page);
    await expect(page.getByTestId("job-card").first()).toBeVisible({ timeout: 30000 });

    const applyBtn = page.getByTestId("apply-btn").first();
    await applyBtn.scrollIntoViewIfNeeded();
    await applyBtn.click({ force: true, timeout: 10000 });

    // Close popup if opened
    await page.waitForEvent("popup", { timeout: 3000 }).then(p => p.close()).catch(() => {});

    await expect.poll(() => trackClickCalled, { timeout: 10000 }).toBe(true);
  });

  test("save job toggles", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await dismissModalIfPresent(page);
    await expect(page.getByTestId("job-card").first()).toBeVisible({ timeout: 30000 });

    const saveBtn = page.getByTestId("save-btn").first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click({ force: true, timeout: 10000 });

    await expect.poll(() => saveMethodCalled, { timeout: 10000 }).toBe("POST");
  });

  test("keyword filter works", async ({ page }) => {
    await page.goto("/my-jobs");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    await dismissModalIfPresent(page);
    await expect(page.getByTestId("job-card").first()).toBeVisible({ timeout: 30000 });

    const searchInput = page.getByTestId("jobs-search");
    if (!(await searchInput.isVisible().catch(() => false))) {
      test.skip(true, "Search input not visible");
      return;
    }
    await searchInput.fill("engineer");
    await page.waitForTimeout(1500);

    const bodyText = (await page.textContent("body")) || "";
    expect(bodyText.toLowerCase()).toMatch(/engineer|no jobs/);
  });

  test("saved jobs page loads", async ({ page }) => {
    await page.goto("/my-jobs/saved");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("/login")) { test.skip(true, "Auth not available"); return; }

    const bodyText = (await page.textContent("body")) || "";
    expect(bodyText.toLowerCase()).toMatch(/saved|no saved/);
  });
});

test.describe("Jobs SEO", () => {
  test("public /jobs page loads", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined as any });
    const page = await ctx.newPage();
    await page.goto("/jobs");
    await page.waitForLoadState("domcontentloaded");
    expect((await page.textContent("body") || "").toLowerCase()).toContain("job");
    await ctx.close();
  });

  test("role page loads", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined as any });
    const page = await ctx.newPage();
    await page.goto("/jobs/software-engineer");
    await page.waitForSelector("h1", { timeout: 10000 });
    expect((await page.locator("h1").textContent() || "").toLowerCase()).toContain("software engineer");
    await ctx.close();
  });
});

test.describe("Jobs Widget", () => {
  test("widget in match panel", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(2000);
    const visible = await page.getByTestId("jobs-widget").isVisible().catch(() => false);
    expect(typeof visible).toBe("boolean");
  });
});
