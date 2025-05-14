/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Ignore TypeScript errors during build process
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during build process
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
}

module.exports = nextConfig
