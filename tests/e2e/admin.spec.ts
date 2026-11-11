import { test, expect, type Page } from "@playwright/test";

// Admin access depends on ADMIN_EMAIL: a non-admin test user is sent to
// /dashboard by middleware, and these checks are skipped for them.
async function openAdmin(page: Page, path: string): Promise<boolean> {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  return new URL(page.url()).pathname.startsWith("/admin");
}

async function expectHeading(page: Page, path: string, heading: string | RegExp) {
  if (!(await openAdmin(page, path))) test.skip(true, "Test user is not an admin");
  expect(new URL(page.url()).pathname).toBe(path);
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
}

test.describe("Admin Panel", () => {
  test("Admin dashboard loads", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const path = new URL(page.url()).pathname;
    expect(path === "/admin" || path.startsWith("/dashboard")).toBeTruthy();
  });

  test("Admin tests page loads", async ({ page }) => {
    await expectHeading(page, "/admin/tests", "Tests");
  });

  test("Admin users page loads", async ({ page }) => {
    await expectHeading(page, "/admin/users", "Users");
  });

  test("Admin prompts page loads", async ({ page }) => {
    await expectHeading(page, "/admin/ai/prompts", "AI");
    await expect(page.getByRole("link", { name: "Prompts", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("Admin pricing page loads", async ({ page }) => {
    await expectHeading(page, "/admin/plans/prices", "Plans & Pricing");
    await expect(page.getByRole("link", { name: "Prices", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("Admin emails page loads", async ({ page }) => {
    await expectHeading(page, "/admin/email/templates", "Email");
    await expect(page.getByRole("link", { name: "Templates", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("Old admin URLs redirect to their new tab", async ({ page }) => {
    const moves: [string, string][] = [
      ["/admin/funnel", "/admin/growth/funnel"],
      ["/admin/marketing-analytics", "/admin/growth/traffic"],
      ["/admin/prompts", "/admin/ai/prompts"],
      ["/admin/emails", "/admin/email/templates"],
      ["/admin/pricing", "/admin/plans/prices"],
      ["/admin/mentorship/leads", "/admin/course/leads"],
    ];
    for (const [from, to] of moves) {
      if (!(await openAdmin(page, from))) test.skip(true, "Test user is not an admin");
      expect(new URL(page.url()).pathname, `${from} should land on ${to}`).toBe(to);
    }
  });
});
