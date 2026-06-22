"use client";
// 네이티브 앱이 Universal/App Link 또는 커스텀 스킴으로 열렸을 때, 들어온 URL을
// 파싱해 WebView를 해당 라우트로 이동시킨다. 앱은 server.url을 루트로 로드하므로
// 딥링크 경로로의 이동은 이 핸들러가 router.push로 처리한다.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/app/utils/platform";
import { UNIVERSAL_HOST, APP_SCHEME } from "@/app/utils/deeplink";

export default function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;

    let remove;
    let active = true;

    (async () => {
      // 동적 import: 웹 번들에서 @capacitor/app을 강제 로드하지 않도록.
      const { App } = await import("@capacitor/app");
      const sub = await App.addListener("appUrlOpen", ({ url }) => {
        try {
          const u = new URL(url);
          let path;
          if (u.protocol.startsWith("http") && u.host === UNIVERSAL_HOST) {
            // Universal/App Link: https://host/{locale}/share/{id}
            path = u.pathname + u.search;
          } else if (u.protocol === `${APP_SCHEME}:`) {
            // 커스텀 스킴은 두 형식을 모두 처리한다:
            //   thelifemuseum:///{locale}/share/{id}  (host 비움 → pathname만)
            //   thelifemuseum://payment/success?...    (host=payment → 경로에 합침)
            const host = u.host ? `/${u.host}` : "";
            path = host + (u.pathname || "") + u.search || "/";
          }
          if (path) router.push(path);
        } catch {
          /* malformed url → 무시 */
        }
      });
      if (!active) {
        sub.remove();
      } else {
        remove = () => sub.remove();
      }
    })();

    return () => {
      active = false;
      if (remove) remove();
    };
  }, [router]);

  return null;
}
