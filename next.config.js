/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: [
      "app",
      "components",
      "lib",
      "pages",
      "scripts",
      "types",
      "prisma",
      "test",
      "auth.ts",
    ],
  },
};

module.exports = nextConfig;
