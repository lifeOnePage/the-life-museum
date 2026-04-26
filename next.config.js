// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev",
        pathname: "/reel/**",
      },
      {
        protocol: "https",
        hostname: "pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev",
        pathname: "/reels/**",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
