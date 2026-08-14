import { describe, it, expect } from "vitest";

/* The suite must never point at a remote database — see SETUP.md §3.
 *
 * This is the cheapest possible guard for the two rules that are easy to
 * break silently and expensive to diagnose:
 *
 *   1. Remote drift. If .env.test picks up a cloud URL, or the
 *      `dotenv -e .env.test -e .env.local` ordering breaks so .env.local
 *      wins, the suite still passes — just 150x slower, with timeouts that
 *      look exactly like flaky tests. Hours have gone into chasing that.
 *   2. Cross-project bleed. These builds carry different data sensitivities
 *      and must not share a database. Pointing at a sibling's test DB would
 *      otherwise go unnoticed until something leaked.
 *
 * If this file is the only thing failing, fix the environment, not the test.
 */
describe("test database", () => {
  const url = process.env.DATABASE_URL ?? "";

  it("is set — run via `npm test` so dotenv loads .env.test", () => {
    expect(url).not.toBe("");
  });

  it("is local, never remote", () => {
    expect(url).toMatch(/@(localhost|127\.0\.0\.1)[:/]/);
    expect(url).not.toMatch(/neon\.tech|amazonaws\.com|supabase\.co|\.cloud/i);
  });

  it("is this project's own database, not a sibling build's", () => {
    expect(url).toContain("fnol_intake_test");
  });
});
