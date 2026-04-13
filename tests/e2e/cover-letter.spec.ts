import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

test.describe("Cover Letter", () => {
  test("Cover letter tab loads", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-cover-letter"]', { timeout: 15000 });
    await page.click('[data-testid="tab-cover-letter"]');
    await page.waitForTimeout(2000);
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Cover Letter") || pageText.includes("Generate")).toBeTruthy();
  });
});
