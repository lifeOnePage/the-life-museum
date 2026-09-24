// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 모드의 Next.js 배지("N")가 감상 화면 오른쪽 위 BGM 재생/정지 버튼과
  // 정확히 겹쳐 가리므로 끈다 (오류 오버레이는 그대로 뜬다). 프로덕션에는 영향 없음
  devIndicators: false,
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
