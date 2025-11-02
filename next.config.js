// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev',
        pathname: '/reel/**', // R2에서 사용하는 경로 패턴
      },
      {
        protocol: 'https',
        hostname: 'pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev',
        pathname: '/reels/**', // R2에서 사용하는 경로 패턴
      },
    ],
  },
};
module.exports = nextConfig;
