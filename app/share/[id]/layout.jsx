// 서버 컴포넌트 — 공유 링크 OG 미리보기(카카오톡 등) 메타 제공.
// page.jsx는 "use client"라 메타를 못 넣으므로, 이 레이아웃에서 서버 사이드로
// 앨범 제목/커버를 읽어 og:title / og:image 를 렌더한다.

const API_BASE =
  "https://the-life-museum-backend-production.up.railway.app";
const SITE = "https://www.thelifememory.com";

// 영상 커버는 og:image로 쓸 수 없으므로 뒷면 이미지로 폴백
function isVideo(url = "") {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const fallback = {
    title: "theLIFEmemory",
    description: "소중한 순간을 앨범으로 간직하세요.",
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/record/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("record fetch failed");

    const json = await res.json();
    const data = json?.data || {};

    // 비공개 앨범은 제목/커버 노출 방지 — 기본 미리보기만
    if (!data.isPublic) return fallback;

    const title = (data.title && data.title.trim()) || fallback.title;
    const description =
      (data.subtitle && data.subtitle.trim()) || fallback.description;

    // 커버가 이미지면 커버, 영상이면 뒷면(PNG) 폴백, 둘 다 없으면 이미지 생략
    const coverUrl = data.coverImage?.url || "";
    const ogImage =
      coverUrl && !isVideo(coverUrl)
        ? coverUrl
        : data.backCoverImageUrl || null;

    const images = ogImage ? [{ url: ogImage }] : [];

    return {
      title,
      description,
      openGraph: {
        type: "website",
        title,
        description,
        url: `${SITE}/share/${id}`,
        siteName: "theLIFEmemory",
        images,
      },
      twitter: {
        card: images.length ? "summary_large_image" : "summary",
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch {
    return { title: fallback.title, description: fallback.description };
  }
}

export default function ShareLayout({ children }) {
  return children;
}
