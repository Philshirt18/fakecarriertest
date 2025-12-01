/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
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
