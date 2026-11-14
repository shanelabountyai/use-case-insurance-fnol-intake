import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { assertLocalTestDatabase } from "./packages/db/local-guard";

// K12: refuse to run the suite at all unless DATABASE_URL is this project's
// local test database (loaded from .env.test by `npm test`).
assertLocalTestDatabase(process.env.DATABASE_URL, "fnol_intake_test");

export default defineConfig({
  resolve: {
    // Mirrors apps/web/tsconfig.json's "@/*" so tests import app modules the
    // same way the app does, without maintaining relative paths.
    alias: { "@": fileURLToPath(new URL("./apps/web", import.meta.url)) },
  },
  test: {
    environment: "node",
    passWithNoTests: true,
    include: ["tests/**/*.test.ts", "apps/**/*.test.ts", "packages/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
  },
});
