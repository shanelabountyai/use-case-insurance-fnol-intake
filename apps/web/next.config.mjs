/** @type {import('next').NextConfig} */
const nextConfig = {
  // @fnol/core and @fnol/db are workspace TypeScript, not built packages.
  transpilePackages: ["@fnol/core", "@fnol/db"],
};
export default nextConfig;
