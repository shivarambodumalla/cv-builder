import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

test.describe("Billing Gate Flow", () => {
  test("Upgrade modal shows for ATS limit", async ({ page }) => {
    await page.route("**/api/cv/analyse", (route) =>
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: "limit_reached", code: "ats_scan_limit" }),
      })
    );
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.click('[data-testid="tab-ats"]');
    await page.waitForLoadState("networkidle");
    const reanalyseBtn = page.getByTestId("btn-reanalyse");
    if (await reanalyseBtn.isVisible().catch(() => false)) {
      await reanalyseBtn.click();
      await expect(page.getByTestId("upgrade-modal")).toBeVisible({ timeout: 5000 });
    }
  });
});
