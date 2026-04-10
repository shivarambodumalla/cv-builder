import { Page } from "@playwright/test";

export const TEST_USER_ID = "84b43241-814c-4fce-8afa-0bcd10a0635c";
export const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

export async function navigateToCV(page: Page) {
  await page.goto(`/resume/${TEST_CV_ID}`);
  await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
}

export async function navigateToATSTab(page: Page) {
  await navigateToCV(page);
  await page.click('[data-testid="tab-ats"]');
  await page.waitForTimeout(1000);
}

export async function navigateToJobMatchTab(page: Page) {
  await navigateToCV(page);
  await page.click('[data-testid="tab-match"]');
  await page.waitForSelector('[data-testid="jd-input"]', { timeout: 10000 }).catch(() => {});
}
