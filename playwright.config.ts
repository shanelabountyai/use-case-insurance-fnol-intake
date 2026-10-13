import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:5500" },
  webServer: {
    // Production build + serve, the way the app ships (e2e:server builds with
    // .env.test so the app and the specs see the same local database).
    // E2E_DEV=1 falls back to the dev server to debug one failing spec.
    command: process.env.E2E_DEV ? "npm run dev:test" : "npm run e2e:server",
    url: "http://localhost:5500",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
