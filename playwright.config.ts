import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    // dev:test, NOT dev. With plain `npm run dev` the app under test talks to
    // the cloud database while the specs talk to localhost — a split brain
    // where a spec seeds a record the app cannot see.
    command: "npm run dev:test",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
