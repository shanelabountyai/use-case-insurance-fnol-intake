import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PORT = "5500"; // this build's own port (grant-proposal 5400, ticket-deflection 5600)
const read = (p: string) => readFileSync(p, "utf8");

/* K14: ignoreCommand per the foundation recipe, own port everywhere, no unguarded crons. */
describe("deploy hygiene", () => {
  // apps/web is the Vercel project root (its package.json carries vercel-build).
  const vercel = JSON.parse(read("apps/web/vercel.json"));

  it("skips builds when only docs or markdown changed, and builds when unsure", () => {
    const cmd: string = vercel.ignoreCommand;
    expect(cmd).toContain('cd "$(git rev-parse --show-toplevel)"'); // monorepo: diff the whole repo, packages included
    expect(cmd).toContain('git cat-file -e "${VERCEL_GIT_PREVIOUS_SHA}^{commit}"'); // unknown previous sha => build
    expect(cmd).toContain("git diff --quiet \"$VERCEL_GIT_PREVIOUS_SHA\" HEAD -- . ':(exclude)docs' ':(exclude)*.md'");
    expect(cmd.trim().endsWith("|| exit 1")).toBe(true);
  });

  it("declares no cron routes (none exist; any added must be constant-time and fail closed)", () => {
    expect(vercel.crons ?? []).toEqual([]);
  });

  it("dev, start and e2e all use this build's own port", () => {
    const web = JSON.parse(read("apps/web/package.json"));
    expect(web.scripts.dev).toContain(`-p ${PORT}`);
    expect(web.scripts.start).toContain(`-p ${PORT}`);
    const pw = read("playwright.config.ts");
    expect(pw.match(/localhost:(\d+)/g)?.every((m) => m === `localhost:${PORT}`)).toBe(true);
  });
});
