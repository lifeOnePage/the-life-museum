/**
 * 프로필과 아이템들의 이미지를 하나의 텍스쳐 배열로 빌드
 * @param {Object} profile - 프로필 데이터 { photo: string }
 * @param {Array} items - 아이템 배열 [{ id, img: [string] }]
 * @returns {Object} { textures: Array, itemRanges: Object }
 */
export function buildTextureData(profile, items) {
  const textures = [];
  const itemRanges = {};

  let currentIndex = 0;

  // 1. 프로필 이미지 추가
  if (profile?.photo) {
    const startIndex = currentIndex;
    textures.push({
      kind: 'image',
      url: profile.photo,
      itemId: 'profile',
      itemIndex: -1,
    });
    currentIndex++;
    itemRanges['profile'] = { start: startIndex, end: startIndex };
  }

  // 2. 각 아이템의 이미지들 추가
  items.forEach((item, itemIdx) => {
    const startIndex = currentIndex;

    // 빈 이미지 배열인 경우 empty 텍스쳐 1개 추가
    if (!item.img || item.img.length === 0) {
      textures.push({
        kind: 'empty',
        url: null,
        itemId: item.id,
        itemIndex: itemIdx,
      });
      currentIndex++;
      itemRanges[item.id] = { start: startIndex, end: startIndex };
      console.log(`Item ${item.id} (${item.title}): empty range [${startIndex}, ${startIndex}]`);
      return;
    }

    item.img.forEach((media) => {
      // media가 객체인 경우 (DetailEdit에서 생성된 경우)
      const url = typeof media === 'string' ? media : media.url;
      const kind = detectMediaType(url);

      textures.push({
        kind,
        url,
        itemId: item.id,
        itemIndex: itemIdx,
      });
      currentIndex++;
    });

    itemRanges[item.id] = { start: startIndex, end: currentIndex - 1 };
    console.log(`Item ${item.id} (${item.title}): range [${startIndex}, ${currentIndex - 1}]`);
  });

  console.log('Total textures:', textures.length);
  console.log('Item ranges:', itemRanges);

  return { textures, itemRanges };
}

/**
 * URL로부터 미디어 타입 감지
 * @param {string} url
 * @returns {string} 'image' | 'video' | 'empty'
 */
function detectMediaType(url) {
  if (!url) return 'empty';

  const lower = url.toLowerCase();

  // 비디오 확장자
  if (lower.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) {
    return 'video';
  }

  // 이미지 확장자
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/)) {
    return 'image';
  }

  // 기본값은 이미지로 간주
  return 'image';
}

/**
 * 최소 개수 보장 (빈 슬롯 추가)
 * @param {Array} textures
 * @param {number} minCount
 * @returns {Array}
 */
export function ensureMinimumTextures(textures, minCount = 100) {
  const result = [...textures];

  while (result.length < minCount) {
    result.push({
      kind: 'empty',
      url: null,
      itemId: null,
      itemIndex: -1,
    });
  }

  return result;
}
