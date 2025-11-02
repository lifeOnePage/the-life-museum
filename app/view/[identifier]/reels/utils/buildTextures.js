// app/view/utils/buildTextures.js  등 공용 위치에 두고 import 해서 사용하세요.

// 비디오 판별(확장자 기준)
const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

function kindOf(url) {
  return VIDEO_EXT.test(String(url || "")) ? "video" : "image";
}

/**
 * fetchPreview 결과(data) → { media, slots, ranges, total }
 * - media: [{type: 'image'|'video'|'text'|'empty', url?, text?, section, groupId?}, ...]
 * - slots: 길이 >= 100 (부족분은 type:'empty')
 * - ranges: HUD용 섹션 범위 인덱스 {profile:{start,end}, lifestory:{...}, childhood:{...}, experience:{...}, relationship:{...}, all:{start:0,end:total-1}}
 * - total: 실제 미디어(빈칸 제외) 개수
 */
export function buildTexturesFromPreview(data) {
  const media = [];

  // 1) 프로필 이미지 (있으면 제일 앞)
  const profileUrl = data?.profile?.profileImg || null;
  if (profileUrl) {
    media.push({
      type: kindOf(profileUrl), // image | video
      url: profileUrl,
      section: "profile",
    });
  }

  // 2) 생애문(텍스트 토큰)
  const story = data?.profile?.story;
  if (story && String(story).trim()) {
    media.push({
      type: "text",
      text: String(story),
      section: "lifestory",
    });
  }

  // 3) 유년시절: data.gallery.childhood = [url, ...]
  const childhoodArr = Array.isArray(data?.gallery?.childhood)
    ? data.gallery.childhood
    : [];
  childhoodArr.forEach((url) => {
    if (!url) return;
    media.push({
      type: kindOf(url),
      url,
      section: "childhood",
    });
  });

  // 4) 경험: data.gallery.experience = [{id, title, description, photos:[url,...]}, ...]
  const expArr = Array.isArray(data?.gallery?.experience)
    ? data.gallery.experience
    : [];
  expArr.forEach((exp) => {
    const photos = Array.isArray(exp?.photos) ? exp.photos : [];
    photos.forEach((url) => {
      if (!url) return;
      media.push({
        type: kindOf(url),
        url,
        section: "experience",
        groupId: exp?.id ?? null, // 섹션 내 그룹 식별용(선택 범위 계산에 유용)
      });
    });
  });

  // 5) 인연: data.gallery.relationship = [{id, name, relation, photos:[url,...]}, ...]
  const relArr = Array.isArray(data?.gallery?.relationship)
    ? data.gallery.relationship
    : [];
  relArr.forEach((rel) => {
    const photos = Array.isArray(rel?.photos) ? rel.photos : [];
    photos.forEach((url) => {
      if (!url) return;
      media.push({
        type: kindOf(url),
        url,
        section: "relationship",
        groupId: rel?.id ?? null,
      });
    });
  });

  // 중복 URL 제거(텍스트는 내용 기준)
  const seen = new Set();
  const deduped = [];
  for (const m of media) {
    const key =
      m.type === "text"
        ? `text|${m.text.slice(0, 64)}`
        : `${m.type}|${m.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(m);
  }

  // HUD용 섹션 범위 계산
  let cursor = 0;
  const ranges = {};
  const pushRange = (name, count) => {
    if (!count) return;
    ranges[name] = { start: cursor, end: cursor + count - 1 };
    cursor += count;
  };

  const countProfile = profileUrl ? 1 : 0;
  const countStory = story && String(story).trim() ? 1 : 0;
  const countChildhood = childhoodArr.length;
  const countExp = expArr.reduce(
    (acc, e) => acc + (Array.isArray(e?.photos) ? e.photos.length : 0),
    0,
  );
  const countRel = relArr.reduce(
    (acc, r) => acc + (Array.isArray(r?.photos) ? r.photos.length : 0),
    0,
  );

  pushRange("profile", countProfile);
  pushRange("lifestory", countStory);
  pushRange("childhood", countChildhood);
  pushRange("experience", countExp);
  pushRange("relationship", countRel);

  const total = deduped.length;
  ranges.all = total ? { start: 0, end: total - 1 } : { start: 0, end: 0 };

  // 슬롯은 최소 100칸
  const slotCount = Math.max(100, total);
  const slots = Array.from({ length: slotCount }, (_, i) =>
    i < total ? deduped[i] : { type: "empty", section: "empty" },
  );

  return { media: deduped, slots, ranges, total };
}
