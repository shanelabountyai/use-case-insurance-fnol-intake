// Runs once when the server starts. K11: refuse to boot on an invalid
// environment instead of failing later on the first request that needs it.
export async function register() {
  const { parseEnv } = await import("./lib/env");
  parseEnv(process.env);
}
