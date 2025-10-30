// apiClient.js (아무 JS 파일에서 임포트해 써도 됩니다)

/** ISO 날짜 헬퍼 */
function iso(y, m, d) {
  // m: 1~12
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

/** 기본(생성 전용) 페이로드 — id 없이 createMany가 일어나도록 구성 */
export function makeDummyGalleryPayload() {
  return {
    childhood: [
      { data: { srcType: 0, srcUrl: "/images/childhood-1.jpg" } },
      { data: { srcType: 0, srcUrl: "/images/childhood-2.jpg" } },
    ],
    memory: [
      {
        data: {
          title: "소풍 가던 날",
          subTitle: "초등학교",
          date: iso(2010, 5, 12),
          comment: "비 왔지만 즐거웠다",
        },
      },
      {
        data: {
          title: "첫 출근",
          subTitle: "스타트업",
          date: iso(2020, 3, 2),
          comment: "긴장 반 설렘 반",
        },
      },
    ],
    relationship: [
      { data: { name: "엄마", relation: "mother", comment: "늘 고마운 사람" } },
      { data: { name: "지훈", relation: "friend", comment: "초등학교 동창" } },
    ],
  };
}

/**
 * (선택) 혼합 테스트용 페이로드
 * - 일부는 신규(create), 일부는 기존(update) 시나리오를 동시에 테스트할 때 사용
 * - id 값은 DB에 실제 존재해야 update가 성공합니다.
 */
export function makeMixedPayloadWithIds(existingIds = {}) {
  // existingIds 예: { memory: [3], relationship: [7], childhood: [12] }
  return {
    childhood: [
      // update (id가 실제 있어야 함)
      ...(existingIds.childhood?.[0]
        ? [{ id: existingIds.childhood[0], data: { srcType: 1, srcUrl: "/images/childhood-1-updated.jpg" } }]
        : []),
      // create
      { data: { srcType: 0, srcUrl: "/images/childhood-new.jpg" } },
    ],
    memory: [
      ...(existingIds.memory?.[0]
        ? [{ id: existingIds.memory[0], data: { title: "제목 수정", comment: "코멘트 수정" } }]
        : []),
      { data: { title: "새 추억", date: iso(2024, 7, 1), comment: "해변 여행" } },
    ],
    relationship: [
      ...(existingIds.relationship?.[0]
        ? [{ id: existingIds.relationship[0], data: { name: "아빠", relation: "father" } }]
        : []),
      { data: { name: "민지", relation: "friend", comment: "대학 동기" } },
    ],
  };
}