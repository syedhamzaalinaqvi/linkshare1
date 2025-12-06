import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/moovie',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
};

export default nextConfig;
