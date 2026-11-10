import { test, expect } from "@playwright/test";
import { getTestUserPlan, TEST_CV_ID } from "./helpers/auth";

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
      // The refusal shows inline above the old report; its button opens the modal.
      const notice = page.getByTestId("ats-scan-used");
      await expect(notice).toBeVisible({ timeout: 5000 });
      await notice.getByRole("button", { name: "Upgrade for unlimited scans" }).click();
      await expect(page.getByTestId("upgrade-modal")).toBeVisible({ timeout: 5000 });
    }
  });

  test("Fix All returns 403 fix_all_limit for the free plan", async ({ page }) => {
    const plan = await getTestUserPlan(page);
    test.skip(plan !== "free", `Fix All is gated for the free plan only; the test user is ${plan}`);

    // Real request, no mock: the route must refuse before any AI call.
    const res = await page.request.post("/api/cv/fix-all", { data: { cv_id: TEST_CV_ID } });
    expect(res.status()).toBe(403);
    const body = (await res.json()) as { code?: string; proOnly?: boolean };
    expect(body.code).toBe("fix_all_limit");
  });
});
