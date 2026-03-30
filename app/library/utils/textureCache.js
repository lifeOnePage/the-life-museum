// 라우트 전환 간 텍스처 재로드 방지 (모듈-레벨 캐시 — 페이지 언마운트에도 유지)
// staticTextureCache: url → THREE.Texture (GLContextLoss 시 자동 재업로드됨)
export const staticTextureCache = new Map();

// gifFrameCache: url → { frames: GIF frame[], width: number, height: number }
// CanvasTexture는 GL 컨텍스트 의존적이므로 캐시하지 않고 프레임 데이터만 보관
export const gifFrameCache = new Map();
