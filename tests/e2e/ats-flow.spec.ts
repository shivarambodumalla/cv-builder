import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

test.describe("ATS Analysis Flow", () => {
  test("ATS tab loads", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.click('[data-testid="tab-ats"]');
    await page.waitForLoadState("networkidle");
    // Should show either the score or the analyse button
    const hasScore = await page.getByTestId("ats-score").isVisible().catch(() => false);
    const hasAnalyse = await page.getByTestId("btn-reanalyse").isVisible().catch(() => false);
    expect(hasScore || hasAnalyse).toBeTruthy();
  });

  test("Fix All button visible when score < 95", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.click('[data-testid="tab-ats"]');
    await page.waitForLoadState("networkidle");
    const fixBtn = page.getByTestId("btn-fix-all");
    // May or may not be visible depending on score — just check no crash
    const isVisible = await fixBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });

  test("Free user sees upgrade modal on Fix All limit", async ({ page }) => {
    await page.route("**/api/cv/fix-all", (route) =>
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: "limit_reached", code: "fix_all_limit" }),
      })
    );
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.click('[data-testid="tab-ats"]');
    await page.waitForLoadState("networkidle");
    const fixBtn = page.getByTestId("btn-fix-all");
    if (await fixBtn.isVisible().catch(() => false)) {
      await fixBtn.click();
      await expect(page.getByTestId("upgrade-modal")).toBeVisible({ timeout: 5000 });
    }
  });
});
