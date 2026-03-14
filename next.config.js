/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'store1.gofile.io',
      },
      {
        protocol: 'https',
        hostname: '*.gofile.io',
      },
    ],
  },
}

module.exports = nextConfig