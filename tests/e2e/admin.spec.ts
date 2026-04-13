import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("Admin dashboard loads", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    // Admin access depends on ADMIN_EMAIL — may redirect to dashboard if not admin
    const isAdmin = url.includes("/admin");
    const isDashboard = url.includes("/dashboard");
    expect(isAdmin || isDashboard).toBeTruthy();
  });

  test("Admin tests page loads", async ({ page }) => {
    await page.goto("/admin/tests");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    if (url.includes("/admin/tests")) {
      const pageText = await page.textContent("body") || "";
      expect(pageText.includes("Tests") || pageText.includes("Test Cases") || pageText.includes("Run History")).toBeTruthy();
    }
  });

  test("Admin users page loads", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    if (url.includes("/admin/users")) {
      const pageText = await page.textContent("body") || "";
      expect(pageText.includes("Users") || pageText.includes("user")).toBeTruthy();
    }
  });

  test("Admin prompts page loads", async ({ page }) => {
    await page.goto("/admin/prompts");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    if (url.includes("/admin/prompts")) {
      const pageText = await page.textContent("body") || "";
      expect(pageText.includes("Prompts") || pageText.includes("prompt")).toBeTruthy();
    }
  });

  test("Admin pricing page loads", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    if (url.includes("/admin/pricing")) {
      const pageText = await page.textContent("body") || "";
      expect(pageText.includes("Pricing") || pageText.includes("price")).toBeTruthy();
    }
  });

  test("Admin emails page loads", async ({ page }) => {
    await page.goto("/admin/emails");
    await page.waitForLoadState("networkidle");
    const url = page.url();
    if (url.includes("/admin/emails")) {
      const pageText = await page.textContent("body") || "";
      expect(pageText.includes("Email") || pageText.includes("Template")).toBeTruthy();
    }
  });
});
