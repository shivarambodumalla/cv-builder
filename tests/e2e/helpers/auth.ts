import { Page } from "@playwright/test";

export const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
export const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

export async function setupTestSession(page: Page) {
  await page.setExtraHTTPHeaders({ "x-test-user-id": TEST_USER_ID });
}

export async function navigateToCV(page: Page) {
  await page.goto(`/resume/${TEST_CV_ID}`);
  await page.waitForLoadState("networkidle");
}

export async function navigateToATSTab(page: Page) {
  await navigateToCV(page);
  await page.click('[data-testid="tab-ats"]');
  await page.waitForLoadState("networkidle");
}

export async function navigateToJobMatchTab(page: Page) {
  await navigateToCV(page);
  await page.click('[data-testid="tab-match"]');
  await page.waitForLoadState("networkidle");
}
