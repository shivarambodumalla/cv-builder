import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";
const TEST_JD = "We are looking for a Senior ML Engineer. Requirements: 5+ years ML experience, Python, PyTorch, MLOps, Kubernetes. Knowledge of CUDA preferred. Hybrid work, health insurance provided.";

test.describe("Job Match Flow", () => {
  test("Job match tab loads with JD input", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.click('[data-testid="tab-match"]');
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("jd-input")).toBeVisible();
  });

  test("Analyse match button exists", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.click('[data-testid="tab-match"]');
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("btn-analyse-match")).toBeVisible();
  });
});
