// K7 / INV-15: on every response. HSTS is inert over http (localhost) and
// enforced once deployed behind https.
export const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @fnol/core and @fnol/db are workspace TypeScript, not built packages.
  transpilePackages: ["@fnol/core", "@fnol/db"],
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
};
export default nextConfig;
