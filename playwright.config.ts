import { defineConfig } from "@playwright/test";

// Load .env.local for local development (CI gets env vars from GitHub secrets)
try { require("dotenv").config({ path: ".env.local" }); } catch { /* dotenv not needed in CI */ }

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    storageState: "tests/e2e/.auth/user.json",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 60000,
    env: {
      ENABLE_TEST_AUTH: "true",
    },
  },
});
