import { describe, expect, it } from "vitest";
import nextConfig from "../apps/web/next.config.mjs";

/* K7 / INV-15: every response carries the global security headers. */
describe("security headers", () => {
  it("apply to every path", async () => {
    const rules: { source: string; headers: { key: string; value: string }[] }[] = await nextConfig.headers();
    const all = rules.find((r) => r.source === "/:path*");
    expect(all).toBeDefined();
    const byKey = Object.fromEntries(all!.headers.map((h) => [h.key.toLowerCase(), h.value]));
    expect(byKey["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["x-content-type-options"]).toBe("nosniff");
    expect(byKey["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(byKey["x-frame-options"]).toBe("DENY");
    expect(byKey["strict-transport-security"]).toMatch(/max-age=\d{8,}/);
  });

  it("does not advertise the framework", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
