import { Page } from "@playwright/test";

export const TEST_USER_ID = "84b43241-814c-4fce-8afa-0bcd10a0635c";
export const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

export type TestUserPlan = "free" | "pro" | "unknown";

/**
 * Which plan the seeded test user is on right now. POST /api/billing/check-limit
 * returns `{ limitReached, used, limit }` only when its free-plan branch ran
 * (Pro and unlimited quotas answer `{ limitReached: false }` alone), so a
 * numeric `limit` on the lifetime ATS scan means "free". Plan-specific tests
 * skip on the other plan instead of failing: scripts/seed-test-data.sql seeds
 * the user as Pro, so the free-plan checks only run against a free account.
 */
export async function getTestUserPlan(page: Page): Promise<TestUserPlan> {
  const res = await page.request
    .post("/api/billing/check-limit", { data: { feature: "ats_scan" } })
    .catch(() => null);
  if (!res || !res.ok()) return "unknown";
  const body = (await res.json().catch(() => null)) as { limit?: unknown } | null;
  if (!body) return "unknown";
  return typeof body.limit === "number" ? "free" : "pro";
}

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
