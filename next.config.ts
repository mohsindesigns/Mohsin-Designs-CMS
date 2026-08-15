import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eaglerevolution.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/contact',
        destination: '/contact-us',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Proxy /cdn-images/:path* → Cloudinary
        // This allows serving images from eaglerevolution.com/cdn-images/...
        // instead of exposing res.cloudinary.com/dytytwyp6/image/upload/...
        source: '/cdn-images/:path*',
        destination: 'https://res.cloudinary.com/dytytwyp6/image/upload/:path*',
      },
    ];
  },
};

export default nextConfig;