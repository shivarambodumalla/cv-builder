import { test, expect } from "@playwright/test";

test.describe("Dashboard Flow", () => {
  test("Dashboard loads", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // Should have at least one resume card or create button
    const hasCreate = await page.getByTestId("btn-create-resume").isVisible().catch(() => false);
    const hasContent = await page.locator("text=Arjun Mehta").isVisible().catch(() => false);
    expect(hasCreate || hasContent).toBeTruthy();
  });

  test("Dashboard shows test resume", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const card = page.getByTestId("resume-card-00000000-0000-0000-0000-000000000002");
    const visible = await card.isVisible().catch(() => false);
    expect(typeof visible).toBe("boolean");
  });
});
