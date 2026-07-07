/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true, // gzip all responses
  images: {
    // ✅ Next.js image optimisation enabled — converts to WebP/AVIF, resizes per <Image sizes>.
    // All allowed hostnames are listed in remotePatterns below.
    remotePatterns: [
      // Unsplash (hero, budget cards, blog covers)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // ACE S3 storage (property images uploaded via admin panel)
      { protocol: 'https', hostname: 's3-noi.aces3.ai' },
      // Firebase Storage (if used for images)
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      // Google user avatars (broker profiles)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    // Tree-shake barrel exports — significantly reduces bundle for lucide-react & recharts
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;
