import { test, expect } from "@playwright/test";
import { TEST_CV_ID } from "./helpers/auth";

test.describe("Job Match Flow", () => {
  test("Job match tab loads", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(3000);

    // On desktop: left panel has JD input OR results, right panel has match score
    // On the left panel the JD input or the match results should show
    const hasInput = await page.locator("textarea").first().isVisible().catch(() => false);
    const hasMatchText = await page.locator("text=Job Match").isVisible().catch(() => false);
    expect(hasInput || hasMatchText).toBeTruthy();
  });
});
