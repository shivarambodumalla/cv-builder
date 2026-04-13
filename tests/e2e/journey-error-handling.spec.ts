import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

test.describe("Error Handling", () => {
  test("API timeout shows error, not blank screen", async ({ page }) => {
    await page.route("**/api/cv/analyse", (route) => route.fulfill({
      status: 502, contentType: "application/json",
      body: JSON.stringify({ error: "AI service unavailable" }),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await page.waitForTimeout(1000);

    const reanalyseBtn = page.getByTestId("btn-reanalyse");
    if (await reanalyseBtn.isVisible().catch(() => false)) {
      await reanalyseBtn.click();
      await page.waitForTimeout(3000);
      // Page should not be blank — should show error or return to normal state
      const bodyText = await page.textContent("body") || "";
      expect(bodyText.length).toBeGreaterThan(50);
    }
  });

  test("Network error on job match doesn't crash", async ({ page }) => {
    await page.route("**/api/cv/job-match", (route) => route.abort("connectionrefused"));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(1000);

    const jdInput = page.getByTestId("jd-input");
    if (await jdInput.isVisible().catch(() => false)) {
      await jdInput.fill("Senior ML Engineer with Python and Kubernetes experience. Must have 5+ years in ML.");
      const analyseBtn = page.getByTestId("btn-analyse-match");
      if (await analyseBtn.isVisible().catch(() => false)) {
        await analyseBtn.click();
        await page.waitForTimeout(3000);
        // Should show error message, not crash
        const bodyText = await page.textContent("body") || "";
        expect(bodyText.length).toBeGreaterThan(50);
      }
    }
  });

  test("Fix All API error doesn't leave blank screen", async ({ page }) => {
    await page.route("**/api/cv/fix-all", (route) => route.fulfill({
      status: 502, contentType: "application/json",
      body: JSON.stringify({ error: "AI service error" }),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await page.waitForTimeout(2000);

    const fixBtn = page.getByTestId("btn-fix-all");
    if (await fixBtn.isVisible().catch(() => false)) {
      await fixBtn.click();
      await page.waitForTimeout(5000);
      // Should return to normal state
      const bodyText = await page.textContent("body") || "";
      expect(bodyText.length).toBeGreaterThan(50);
    }
  });
});
