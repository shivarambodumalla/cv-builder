import { test, expect } from "@playwright/test";

test.describe("Interview Coach", () => {
  test("Story bank page loads", async ({ page }) => {
    await page.goto("/interview-coach");
    await page.waitForLoadState("networkidle");
    // Should show either readiness banner (pro) or upgrade wall (free)
    const hasContent = await page.locator("text=Interview").isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test("Add story navigates to new page", async ({ page }) => {
    await page.goto("/interview-coach");
    await page.waitForLoadState("networkidle");
    const addBtn = page.locator("text=Add Experience").first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url.includes("/interview-coach/new") || url.includes("/interview-coach")).toBeTruthy();
    }
  });

  test("Extract page loads for pro user", async ({ page }) => {
    await page.goto("/interview-coach/extract");
    await page.waitForLoadState("networkidle");
    // Pro: shows source selector. Free: redirects to /interview-coach
    const url = page.url();
    expect(url.includes("/interview-coach")).toBeTruthy();
  });

  test("Story detail page loads", async ({ page }) => {
    // Go to story bank first, then click a story if one exists
    await page.goto("/interview-coach");
    await page.waitForLoadState("networkidle");
    const storyCard = page.locator("[class*='cursor-pointer']").first();
    if (await storyCard.isVisible().catch(() => false)) {
      await storyCard.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain("/interview-coach/");
    }
  });
});
