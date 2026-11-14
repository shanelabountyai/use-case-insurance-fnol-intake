import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { envSchema, parseEnv } from "@/lib/env";
import { register } from "@/instrumentation";

const valid = { DATABASE_URL: "postgresql://u@localhost:5432/fnol_intake_test" };

/* K11 / INV-14: schema-validated env at boot; .env.example names every key. */
describe("env", () => {
  it("boot fails when DATABASE_URL is missing, naming the key", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("an empty value is unset, and still fails a required key", () => {
    expect(() => parseEnv({ DATABASE_URL: "" })).toThrow(/DATABASE_URL/);
    expect(parseEnv({ ...valid, ANTHROPIC_API_KEY: "" }).ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("rejects a bad value without echoing it", () => {
    expect(() => parseEnv({ ...valid, NODE_ENV: "s3cr3t-value" })).toThrow(/NODE_ENV/);
    expect(() => parseEnv({ ...valid, NODE_ENV: "s3cr3t-value" })).not.toThrow(/s3cr3t-value/);
  });

  it("the server's register() hook validates at boot", async () => {
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      await expect(register()).rejects.toThrow(/DATABASE_URL/);
    } finally {
      process.env.DATABASE_URL = saved;
    }
  });

  it("no key is a NEXT_PUBLIC_* variable", () => {
    expect(Object.keys(envSchema.shape).filter((k) => k.startsWith("NEXT_PUBLIC_"))).toEqual([]);
  });

  it(".env.example names exactly the schema keys", () => {
    const example = readFileSync(".env.example", "utf8")
      .split("\n")
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => l.split("=")[0])
      .sort();
    expect(example).toEqual(Object.keys(envSchema.shape).sort());
  });
});
