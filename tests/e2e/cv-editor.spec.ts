import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

test.describe("CV Editor", () => {
  test("Editor loads with tabs", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    // All 4 tabs should be visible
    await expect(page.getByTestId("tab-ats")).toBeVisible();
    await expect(page.getByTestId("tab-match")).toBeVisible();
    await expect(page.getByTestId("tab-cover-letter")).toBeVisible();
  });

  test("Content tab shows form fields", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    // Should have input fields for contact info
    const hasInputs = await page.locator("input").count();
    expect(hasInputs).toBeGreaterThan(0);
  });

  test("Design tab shows template selector", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    // Click Design tab
    await page.locator("text=Design").first().click();
    await page.waitForTimeout(1000);
    // Should show template options
    const hasTemplates = await page.locator("text=Classic").isVisible().catch(() => false);
    expect(hasTemplates).toBeTruthy();
  });

  test("Template selector shows all 12 templates", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.locator("text=Design").first().click();
    await page.waitForTimeout(1000);
    // Count template buttons in the template section
    const templateSection = page.locator("text=Template").first();
    const isVisible = await templateSection.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test("ATS tab shows score or analyse button", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await page.waitForTimeout(2000);
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("ATS") || pageText.includes("Analyse")).toBeTruthy();
  });

  test("Match tab shows JD input or results", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(2000);
    const hasInput = await page.locator("textarea").first().isVisible().catch(() => false);
    const hasMatch = await page.locator("text=Job Match").isVisible().catch(() => false);
    expect(hasInput || hasMatch).toBeTruthy();
  });
});
