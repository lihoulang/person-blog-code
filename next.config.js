/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  output: 'hybrid',  // 混合输出模式，支持静态和动态页面
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