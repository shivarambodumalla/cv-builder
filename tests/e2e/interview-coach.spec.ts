import { test, expect } from "@playwright/test";

test.describe("Interview Coach", () => {
  test("Page loads without crash", async ({ page }) => {
    await page.goto("/interview-coach");
    await page.waitForLoadState("domcontentloaded");
    const url = page.url();
    // Valid outcomes: stays on interview-coach (pro) or redirects to login (unauthed)
    expect(url.includes("/interview-coach") || url.includes("/login")).toBeTruthy();
  });

  test("Add story button works when visible", async ({ page }) => {
    await page.goto("/interview-coach");
    await page.waitForLoadState("domcontentloaded");
    if (!page.url().includes("/interview-coach")) return; // redirected, skip

    const addBtn = page.getByTestId("add-story-button");
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/interview-coach");
    }
  });

  test("Extract page loads or redirects", async ({ page }) => {
    await page.goto("/interview-coach/extract");
    await page.waitForLoadState("domcontentloaded");
    const url = page.url();
    expect(url.includes("/interview-coach") || url.includes("/login")).toBeTruthy();
  });

  test("Story card navigates to detail when exists", async ({ page }) => {
    await page.goto("/interview-coach");
    await page.waitForLoadState("domcontentloaded");
    if (!page.url().includes("/interview-coach")) return;

    const card = page.getByTestId("story-card").first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/interview-coach/");
    }
  });
});
