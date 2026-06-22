// iOS Universal Links 검증 파일 (apple-app-site-association).
// 확장자 없는 경로 + application/json Content-Type 으로, 리다이렉트 없이 서빙해야 함.
// (middleware.js matcher에 \\.well-known 예외가 반드시 있어야 308 리다이렉트가 안 남.)
//
// appIDs = <TeamID>.<BundleID>. 현재 iOS Xcode 기준:
//   DEVELOPMENT_TEAM = 7P96PRD25F, PRODUCT_BUNDLE_IDENTIFIER = com.theliferecord.rec
// TODO(manual): App Store 출시 번들ID/TeamID와 일치하는지 확정 후 필요 시 교체.
export const dynamic = "force-static";

export function GET() {
  const body = {
    applinks: {
      details: [
        {
          appIDs: ["7P96PRD25F.com.theliferecord.rec"],
          components: [
            { "/": "/*/share/*", comment: "공유 앨범 딥링크" },
            { "/": "/*/walk/*", comment: "walk 전시 딥링크" },
            { "/": "/*/vhs/*", comment: "vhs 전시 딥링크" },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
