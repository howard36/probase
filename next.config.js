/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['app', 'components', 'lib', 'pages', 'utils', 'scripts', 'types', 'prisma', 'auth.ts'],
  },
};

module.exports = nextConfig;
