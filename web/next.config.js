/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.fakecarriers.com',
  },
  // Ensure public folder is accessible
  async rewrites() {
    return [
      {
        source: '/logo.png',
        destination: '/logo.png',
      },
    ]
  },
}

module.exports = nextConfig
