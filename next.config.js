/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Links to pages that change prefetch them in full (see
    // components/prefetch-link.tsx). Reuse such a copy for at most 30 seconds
    // (the default is 5 minutes), so a click opens the page instantly but
    // never shows it more than 30 seconds old; hovering or focusing a link
    // whose copy is older fetches it again first.
    staleTimes: {
      static: 30,
    },
  },
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
