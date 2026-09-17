// 방명록 탭 장면 에셋.
// 디자인 원본(목업과 동일한 941×1672 캔버스 레이어 + 화분/꽃 오브젝트 PNG)에서
// 웹용으로 크롭·리사이즈한 파생본만 guestbook/ 아래에 둔다 (원본은 저장소 밖):
//   - bg.jpg / ring.webp / figures.webp — 캔버스 전체 레이어(같은 좌표계라 inset-0으로 겹치면 정렬)
//   - pot-*.webp — 알파 기준 타이트 크롭. 화분 몸통 중심·접지선을 비율로 기록해
//     꽃 종류가 달라도 화분 폭과 바닥 위치가 같게 배치한다.
//   - flower-*.webp — 작성 시트 선택 카드 + 제출 비행 애니메이션용 꽃 한 송이.

export const SCENE_W = 941;
export const SCENE_H = 1672;

const BASE = "/images/memorial/guestbook";

export const SCENE_ASSETS = {
  bg: `${BASE}/bg.jpg`,
  ring: `${BASE}/ring.webp`,
  figures: `${BASE}/figures.webp`,
};

// potCx: 화분 몸통 중심 x (이미지 폭 대비), potBottom: 바닥 접지선 y (이미지 높이 대비),
// potWidth: 화분 몸통 폭 (이미지 폭 대비)
export const FLOWER_ASSETS = {
  chrysanthemum: {
    pot: `${BASE}/pot-chrysanthemum.webp`,
    flower: `${BASE}/flower-chrysanthemum.webp`,
    w: 420,
    h: 1168,
    potCx: 0.4744,
    potBottom: 0.7714,
    potWidth: 0.6556,
  },
  lily: {
    pot: `${BASE}/pot-lily.webp`,
    flower: `${BASE}/flower-lily.webp`,
    w: 420,
    h: 822,
    potCx: 0.4519,
    potBottom: 0.9297,
    potWidth: 0.5191,
  },
  carnation: {
    pot: `${BASE}/pot-carnation.webp`,
    flower: `${BASE}/flower-carnation.webp`,
    w: 420,
    h: 1052,
    potCx: 0.5031,
    potBottom: 0.9967,
    potWidth: 0.7204,
  },
};

export const DEFAULT_FLOWER = "chrysanthemum";

export function getFlowerAsset(type) {
  return FLOWER_ASSETS[type] || FLOWER_ASSETS[DEFAULT_FLOWER];
}
