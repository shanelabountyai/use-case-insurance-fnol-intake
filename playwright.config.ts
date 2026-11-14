import { defineConfig } from "@playwright/test";
import { assertLocalTestDatabase } from "./packages/db/local-guard";

// K12: the e2e server is built and started with the same env as the specs;
// refuse before building anything if that is not the local test database.
assertLocalTestDatabase(process.env.DATABASE_URL, "fnol_intake_test");

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
