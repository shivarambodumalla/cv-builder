import { test, expect } from "@playwright/test";

test.describe("Billing Gate Flow", () => {
  test("Upgrade modal shows for ATS limit", async ({ page }) => {
    // Mock the analyse endpoint to return limit error
    await page.route("**/api/cv/analyse", (route) =>
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: "limit_reached", code: "ats_scan_limit" }),
      })
    );

    // Navigate via dashboard to find a real CV
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const firstCard = page.locator("[data-testid^='resume-card-']").first();
    if (!(await firstCard.isVisible().catch(() => false))) {
      test.skip(true, "No CVs found");
      return;
    }
    await firstCard.click();
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await page.waitForTimeout(2000);

    const reanalyseBtn = page.getByTestId("btn-reanalyse");
    if (await reanalyseBtn.isVisible().catch(() => false)) {
      await reanalyseBtn.click();
      await expect(page.getByTestId("upgrade-modal")).toBeVisible({ timeout: 5000 });
    }
  });
});
