// K12 / INV-18: tests run on a local Postgres, never a cloud database.
// Dependency-free so vitest.config.ts and playwright.config.ts can import it
// before anything else loads. The project rule has no escape hatch: there is
// no supported way to run this suite against a remote database.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function assertLocalTestDatabase(url: string | undefined, expectedDb: string): void {
  if (!url) {
    throw new Error("DATABASE_URL is unset. Run tests via `npm test` / `npm run test:e2e` so .env.test is loaded.");
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL."); // never echo the value: it may carry a password
  }
  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error(`Refusing a non-local test database (host ${parsed.hostname}). Tests run on local Postgres only (K12).`);
  }
  if (parsed.pathname.replace(/^\//, "") !== expectedDb) {
    throw new Error(`Refusing test database "${parsed.pathname.slice(1)}": this project's tests use ${expectedDb} only.`);
  }
}
