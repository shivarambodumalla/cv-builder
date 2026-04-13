import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

test.describe("CV Editor", () => {
  test("Editor loads with tabs", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await expect(page.getByTestId("tab-ats")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("tab-match")).toBeVisible();
    await expect(page.getByTestId("tab-cover-letter")).toBeVisible();
  });

  test("Content tab shows form fields", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await expect(page.getByTestId("tab-ats")).toBeVisible({ timeout: 15000 });
    const inputs = page.locator("input");
    await expect(inputs.first()).toBeVisible();
  });

  test("Design tab opens", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await expect(page.getByTestId("tab-ats")).toBeVisible({ timeout: 15000 });
    await page.getByRole("tab", { name: /design/i }).click();
    // Verify the design panel rendered by checking for font or color controls
    await expect(page.locator("text=Font").or(page.locator("text=Accent")).first()).toBeVisible({ timeout: 5000 });
  });

  test("ATS tab shows content", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await expect(page.getByTestId("tab-ats")).toBeVisible({ timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await expect(page.locator("text=ATS").first()).toBeVisible({ timeout: 5000 });
  });

  test("Match tab shows content", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await expect(page.getByTestId("tab-match")).toBeVisible({ timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await expect(page.locator("textarea, text=Job Match").first()).toBeVisible({ timeout: 5000 });
  });
});
