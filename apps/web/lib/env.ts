import { z } from "zod";

// K11 / INV-14: every key the app reads. `.env.example` must name exactly
// these (tests/env.test.ts checks it), and none may be a NEXT_PUBLIC_* secret.
// Add a key here and to `.env.example` in the same commit.
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1), // this project's own database; tests: local fnol_intake_test only
  DIRECT_URL: z.string().min(1).optional(), // migrations only
  ANTHROPIC_API_KEY: z.string().min(1).optional(), // this build's own key; no code path reads it yet
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  // An empty `NAME=` line (a key waiting for its value) is unset, not an invalid empty string.
  const result = envSchema.safeParse(Object.fromEntries(Object.entries(source).filter(([, v]) => v !== "")));
  if (!result.success) {
    const keys = [...new Set(result.error.issues.map((i) => i.path.join(".")))].join(", ");
    throw new Error(`Invalid environment: ${keys}`); // names only — never echo values
  }
  return result.data;
}
