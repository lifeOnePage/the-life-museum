"use client";
// 카카오톡 공유 (Kakao JS SDK — sendDefault 피드 템플릿).
// 앨범마다 커버/제목이 다르므로 콘솔 커스텀 템플릿 대신 코드에서 값을 직접 전달.

const KAKAO_JS_KEY = "4957e6c439e13b2582e0797cb6d0350b"; // JavaScript 키(공개용)
const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
const SITE = "https://www.thelifememory.com";
const DEFAULT_IMAGE = `${SITE}/logo/logo_512.png`;

let loadingPromise = null;

function loadKakaoSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao SDK: window 없음"));
  }
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve(window.Kakao);
    script.onerror = () => reject(new Error("Kakao SDK 로드 실패"));
    document.head.appendChild(script);
  });
  return loadingPromise;
}

// 카톡 미리보기에서 잘린 HTML 숫자 엔티티("&#...")가 그대로 노출되는 문제 방지 —
// 엔티티만 제거하고 이모지는 그대로 유지, 공백만 정리.
function sanitizeForKakao(str = "") {
  return str
    .replace(/&#x?[0-9a-f]+;?/gi, "") // HTML 숫자 엔티티(및 잘린 &#) 제거
    .replace(/\s+/g, " ")
    .trim();
}

// 커버가 정지 이미지 URL이면 그대로, 아니면(영상·색상값·없음) null → 기본 로고로 대체
export function pickKakaoImage(coverUrl) {
  if (!coverUrl || !/^https?:\/\//i.test(coverUrl)) return null; // "#ffffff" 등 제외
  if (/\.(mp4|webm|mov)(\?|$)/i.test(coverUrl)) return null; // 영상 제외
  return coverUrl;
}

export async function shareAlbumToKakao({
  id,
  title,
  description,
  imageUrl,
  locale = "ko",
}) {
  const Kakao = await loadKakaoSdk();
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);

  const url = `${SITE}/share/${id}`;
  const btnLabel = locale === "en" ? "View album" : "앨범 보기";

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: sanitizeForKakao(title) || "theLIFEmemory",
      description: sanitizeForKakao(description),
      imageUrl: imageUrl || DEFAULT_IMAGE,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [{ title: btnLabel, link: { mobileWebUrl: url, webUrl: url } }],
  });
}
