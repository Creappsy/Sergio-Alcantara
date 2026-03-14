/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  poweredByHeader: false,
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
      {
        protocol: 'https',
        hostname: 'f001.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: '*.backblazeb2.com',
      },
    ],
  },
}

module.exports = nextConfig