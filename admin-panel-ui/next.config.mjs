/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent Next.js from bundling native/server-only packages
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // NOTE: api.bodyParser is not valid in App Router; use export const config in route files if needed.

  serverExternalPackages: [
    'mongoose',
    'bcrypt',
    'firebase-admin',
    'nodemailer',
    'ioredis',
    'bullmq',
    'razorpay',
    'msg91',
    '@googlemaps/google-maps-services-js',
    '@aws-sdk/client-s3',
    'jsonwebtoken',
  ],
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: '/api/v1/:path*',
      },
    ];
  },
}

export default nextConfig
