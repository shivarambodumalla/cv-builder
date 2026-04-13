import { test, expect } from "@playwright/test";

async function expectRedirectToAuth(page: import("@playwright/test").Page) {
  await page.waitForURL(/\/(login|signin|auth)(\?|$)/, { timeout: 15000 });
  expect(page.url()).toMatch(/\/(login|signin|auth)(\?|$)/);
}

test.describe("Auth + Protected Routes", () => {
  test("Unauthenticated user redirected from dashboard", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
    await expectRedirectToAuth(page);
    await context.close();
  });

  test("Unauthenticated user redirected from resume editor", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/resume/some-id", { waitUntil: "domcontentloaded" });
    await expectRedirectToAuth(page);
    await context.close();
  });

  test("Unauthenticated user redirected from billing", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/billing", { waitUntil: "domcontentloaded" });
    await expectRedirectToAuth(page);
    await context.close();
  });

  test("Login page loads", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/sign in|google|log in/i);
    await context.close();
  });
});
