/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'placehold.co', 'via.placeholder.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  output: 'standalone',  // 改为standalone模式，支持Vercel部署
  async rewrites() {
    return [
      {
        source: '/auth/login',
        destination: '/auth/login',
      },
      {
        source: '/auth/register',
        destination: '/auth/register',
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
}

module.exports = nextConfig 