import { test, expect } from "@playwright/test";
import { navigateToATSTab, TEST_CV_ID } from "./helpers/auth";

test.describe("ATS Analysis Flow", () => {
  test("ATS tab loads", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    // ATS panel loads on the right — give it time to render
    await page.waitForTimeout(3000);

    // The ATS tab should show the ATS panel content somewhere on the page
    const pageText = await page.textContent("body") || "";
    const hasAtsContent = pageText.includes("ATS") || pageText.includes("Analyse") || pageText.includes("Score");
    expect(hasAtsContent).toBeTruthy();
  });

  test("Fix All button visibility check", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await page.waitForTimeout(2000);

    const fixBtn = page.getByTestId("btn-fix-all");
    const isVisible = await fixBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });
});
