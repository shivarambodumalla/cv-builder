import { test, expect } from "@playwright/test";

test.describe("Marketing Pages", () => {
  test("Homepage loads with H1", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    const h1 = await page.locator("h1").first().textContent();
    expect(h1).toBeTruthy();
    await context.close();
  });

  test("Pricing page loads", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/pricing");
    await page.waitForLoadState("networkidle");
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Pricing") || pageText.includes("Pro") || pageText.includes("Free")).toBeTruthy();
    await context.close();
  });

  test("Upload resume page loads", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/upload-resume");
    await page.waitForLoadState("networkidle");
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Upload") || pageText.includes("CV") || pageText.includes("Resume")).toBeTruthy();
    await context.close();
  });

  test("Privacy page loads", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/privacy");
    await page.waitForLoadState("networkidle");
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Privacy")).toBeTruthy();
    await context.close();
  });

  test("Terms page loads", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:3000/terms");
    await page.waitForLoadState("networkidle");
    const pageText = await page.textContent("body") || "";
    expect(pageText.includes("Terms")).toBeTruthy();
    await context.close();
  });

  test("Sitemap returns XML", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const res = await page.goto("http://localhost:3000/sitemap.xml");
    expect(res?.status()).toBe(200);
    await context.close();
  });

  test("Robots.txt is accessible", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const res = await page.goto("http://localhost:3000/robots.txt");
    expect(res?.status()).toBe(200);
    const text = await page.textContent("body") || "";
    expect(text.includes("Sitemap")).toBeTruthy();
    await context.close();
  });
});
