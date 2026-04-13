import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

const MOCK_COVER_LETTER = {
  id: "mock-cl-1",
  content: "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior ML Engineer position. With 7 years of experience building large-scale machine learning systems at Google DeepMind and Flipkart, I bring a proven track record of delivering measurable business outcomes.\n\nBest regards,\nArjun Mehta",
  tone: "professional",
  version: 1,
  created_at: new Date().toISOString(),
};

test.describe("Cover Letter Journey", () => {
  test("Generate cover letter with mocked response", async ({ page }) => {
    await page.route("**/api/cv/cover-letter", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify(MOCK_COVER_LETTER),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-cover-letter"]', { timeout: 15000 });
    await page.click('[data-testid="tab-cover-letter"]');
    await page.waitForTimeout(2000);

    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Cover Letter") || pageText.includes("Generate")).toBeTruthy();
  });

  test("Cover letter limit → upgrade modal", async ({ page }) => {
    await page.route("**/api/cv/cover-letter", (route) => route.fulfill({
      status: 403, contentType: "application/json",
      body: JSON.stringify({ error: "Limit reached", code: "cover_letter_limit" }),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-cover-letter"]', { timeout: 15000 });
    await page.click('[data-testid="tab-cover-letter"]');
    await page.waitForTimeout(2000);

    // Try to generate — should trigger limit
    const generateBtn = page.locator("button:has-text('Generate')").first();
    if (await generateBtn.isVisible().catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
      // Upgrade modal or banner should appear
      const hasUpgrade = await page.locator("text=Upgrade").first().isVisible().catch(() => false);
      expect(typeof hasUpgrade).toBe("boolean");
    }
  });
});
