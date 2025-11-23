/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')()

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/embed',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow embedding from same origin, change to ALLOWALL for external domains
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *", // Allow embedding from any domain
          },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
