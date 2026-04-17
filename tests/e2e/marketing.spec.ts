import { test, expect } from "@playwright/test";

// Marketing pages are public — use fresh context (no auth cookies)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Marketing Pages", () => {
  test("Homepage loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
  });

  test("Pricing page loads", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    const text = await page.textContent("body");
    expect(text).toMatch(/pricing|pro|free/i);
  });

  test("Upload resume page loads", async ({ page }) => {
    await page.goto("/upload-resume", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    const text = await page.textContent("body");
    expect(text).toMatch(/upload|cv|resume/i);
  });

  test("Privacy page loads", async ({ page }) => {
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    const text = await page.textContent("body");
    expect(text).toMatch(/privacy/i);
  });

  test("Terms page loads", async ({ page }) => {
    await page.goto("/terms", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
    const text = await page.textContent("body");
    expect(text).toMatch(/terms/i);
  });

  test("Sitemap returns XML", async ({ page }) => {
    const res = await page.goto("/sitemap.xml");
    expect(res?.status()).toBe(200);
  });

  test("Robots.txt is accessible", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body");
    expect(text).toMatch(/sitemap/i);
  });
});
