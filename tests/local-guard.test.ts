import { describe, expect, it } from "vitest";
import { assertLocalTestDatabase } from "../packages/db/local-guard";

const DB = "fnol_intake_test";

/* K12 / INV-18: the code-level guard behind vitest.config.ts, playwright.config.ts and packages/db. */
describe("local test-database guard", () => {
  it("accepts this project's local test database", () => {
    for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
      expect(() => assertLocalTestDatabase(`postgresql://u:p@${host}:5432/${DB}`, DB)).not.toThrow();
    }
  });

  it("refuses a cloud database without echoing the password", () => {
    const url = `postgresql://u:hunter2@ep-x.us-east-2.aws.neon.tech/${DB}?sslmode=require`;
    expect(() => assertLocalTestDatabase(url, DB)).toThrow(/non-local/);
    expect(() => assertLocalTestDatabase(url, DB)).not.toThrow(/hunter2/);
  });

  it("refuses any non-local host, not just known providers", () => {
    expect(() => assertLocalTestDatabase(`postgresql://u@db.internal:5432/${DB}`, DB)).toThrow(/non-local/);
  });

  it("refuses a sibling build's database", () => {
    expect(() => assertLocalTestDatabase("postgresql://u@localhost:5432/grant_proposal_test", DB)).toThrow(DB);
  });

  it("fails closed when unset or unparseable", () => {
    expect(() => assertLocalTestDatabase(undefined, DB)).toThrow(/unset/);
    expect(() => assertLocalTestDatabase("", DB)).toThrow(/unset/);
    expect(() => assertLocalTestDatabase("not a url", DB)).toThrow(/not a valid URL/);
  });
});
