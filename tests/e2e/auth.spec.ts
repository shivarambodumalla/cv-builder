import { test, expect } from "@playwright/test";

test.describe("Auth + Protected Routes", () => {
  test("Unauthenticated user redirected from dashboard", async ({ browser }) => {
    // Create a fresh context WITHOUT saved auth state
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/login");
    await context.close();
  });

  test("Unauthenticated user redirected from resume editor", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/resume/some-id");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/login");
    await context.close();
  });

  test("Unauthenticated user redirected from billing", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/billing");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/login");
    await context.close();
  });

  test("Login page loads", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Sign in") || pageText.includes("Google") || pageText.includes("Log in")).toBeTruthy();
    await context.close();
  });
});
