# 전시공간 (Walk)

3D 몰입형 복도 공간. 카메라가 양쪽 벽에 걸린 미디어 사이를 무한히 이동하며,
각 미디어를 자동 또는 수동으로 포커싱할 수 있다.

---

## 파일 구조

```
app/walk/[id]/
├── page.js
├── CLAUDE.md
└── components/
    ├── displayScene.jsx       # Canvas 래퍼 + API 데이터 패칭 + 재생 컨트롤 UI
    ├── lib/
    │   ├── constants.js       # 모든 수치 상수 정의
    │   └── planeGenerator.js  # seeded PRNG 기반 평면 배치 생성
    └── scene/
        ├── Scene.jsx          # 카메라 이동 + focusMode 상태 머신 + Z 래핑
        ├── WallPlane.jsx      # 개별 미디어 평면 메시 + 인터랙션
        ├── FocusClone.jsx     # auto 포커싱 시 카메라 앞에 등장하는 클론
        ├── MirrorReflection.jsx  # 바닥 반사 효과
        └── GlowBorder.jsx     # auto 포커싱 시 원본 평면 테두리 발광
```

**페이지 진입**: `page.js` → `DisplayScene` → R3F `Canvas` → `Scene`

---

## displayScene.jsx

- `GET /api/v1/record/{recordId}` 호출 → `mediaList` 중 `type === "image"` 필터링
- 필터된 미디어 배열을 `planeGenerator.js`에 전달하여 배치 정보 생성
- 상태: `isPlaying`, `cameraSpeed` (5~100 범위, 기본값 `CAMERA_SPEED`)
- **PlaybackControls UI**: 재생/일시정지 버튼 + 속도 슬라이더 (상단 중앙)
- R3F Canvas에 `<Bloom>` 포스트프로세싱 적용

---

## constants.js — 주요 상수

| 상수 | 값 | 설명 |
|------|----|------|
| `SEED` | 1337 | PRNG 시드 (배치 재현성) |
| `CAMERA_SPEED` | 15 | 기본 카메라 이동 속도 |
| `CAMERA_START_Z` | 0 | 카메라 초기 Z 위치 |
| `CORRIDOR_HALF` | 300 | 복도 절반 너비 (좌우 벽 X 위치) |
| `BASE_HEIGHT` | 80 | 평면 기본 높이 |
| `DISPLAY_OFFSET_Z` | 500 | auto 포커스 클론의 카메라 전방 거리 |
| `DISPLAY_OFFSET_PAUSED` | 150 | 일시정지 중 manual 클릭 시 클론 거리 |
| `DISPLAY_SCALE` | 0.8 | 포커스 클론 스케일 |
| `FOCUS_SEARCH_RANGE` | 800 | auto 포커싱 후보 탐색 Z 범위 |
| `FOCUS_DISMISS_DISTANCE` | 56 | 이 거리 이하 접근 시 포커싱 해제 |
| `FOCUS_MIN_SPEED_RATIO` | 0.2 | auto 포커싱 중 최소 속도 비율 (20%) |
| `FOCUS_FADE_SPEED` | 0.2 | 클론 페이드인 속도 (약 0.67s) |
| `FOG_NEAR` | 500 | 안개 시작 거리 |
| `FOG_FAR` | 10000 | 안개 완전 불투명 거리 |
| `FOG_COLOR` | `"#000000"` | |
| `FLOOR_Y` | 0 | 바닥 Y 위치 |
| `FLOOR_COLOR` | `"#000000"` | |
| `GLOW_COLOR` | `"#ffffff"` | GlowBorder 색상 |
| `GLOW_POINTS_PER_EDGE` | 40 | 테두리 파티클 밀도 |
| `PROXY_URL` | (하드코딩) | 이미지 프록시 서버 URL |

---

## planeGenerator.js

seeded PRNG를 이용해 재현 가능한 미디어 배치를 생성한다.

### 핵심 함수

- **`mulberry32(seed)`**: `SEED=1337` 기반 결정론적 PRNG
- **`generatePlanes(rng, mediaList)`**: 전체 배치 배열 반환

### 배치 알고리즘

1. **미디어 반복**: `FOG_FAR + 2000` 이상을 채울 때까지 mediaList 순환 반복
   - 평균 갭 50유닛 × 아이템 수 = corridor length per pass
2. **좌우 분배**: 홀수 인덱스 → 왼쪽 벽, 짝수 인덱스 → 오른쪽 벽
3. **각 측면 배치**:
   - Y 레인: `[0, 100, 200]` 3개 레인 중 랜덤 선택
   - Z 간격: 50 ± 10 유닛 랜덤
   - Y 오프셋: sine wave(`Math.sin(z * 0.03) * 6`) + 랜덤 ±60
   - X 위치: `sign * CORRIDOR_HALF + Math.sin(z * 0.02) * 40 + random`
   - 회전: X축 -16°~16°, Y축 벽 방향 기준
4. **충돌 검사**: 최근 15개 평면과 AABB + 10유닛 마진 비교. 충돌 시 최대 20회 Y 위치 재시도
5. **출력**: Z 내림차순 정렬, 각 항목에 `position, rotation, url, mediaType, width, height` 포함

---

## Scene.jsx — 핵심 로직

### focusMode 상태 머신

```
idle ──(재생 중 + 주기적 선택)──→ auto
idle ──(재생 중 + 클릭)──────────→ manual
auto ──(FOCUS_DISMISS_DISTANCE 이하 접근)──→ idle → auto (반복)
manual ──(FOCUS_DISMISS_DISTANCE 이하 접근)──→ idle
```

- **auto**: 재생 상태에서 `FOCUS_SEARCH_RANGE` 내 전방 평면 중 랜덤 1개 자동 선택
- **manual**: 사용자가 재생 중 평면을 클릭 시 해당 평면을 포커싱
- idle → auto 전환에는 쿨다운 존재 (이전 포커싱 해제 직후 즉시 재선택 방지)

### Z 래핑 알고리즘

```js
wrapZ(originalZ, cameraZ)
```

카메라가 전진함에 따라 뒤로 멀어진 평면을 앞으로 재배치하여 무한 복도 효과 구현:
- 기준: 카메라 뒤 200유닛 버퍼
- 주기: `corridorSpan` (전체 미디어 배치 길이)
- 래핑된 평면은 동일한 상대 배치를 유지

### 카메라 속도 감속 (auto 포커싱 중)

포커스 클론에 가까워질수록 속도 감소:
- 최대 속도: `cameraSpeed` (사용자 설정값)
- 최소 속도: `cameraSpeed * FOCUS_MIN_SPEED_RATIO` (20%)
- 거리에 비례한 선형 보간

### 기타

- **텍스처 캐시** (`textureMap`): 평면 URL → THREE.Texture, 메모리에만 보유
- **강제 리렌더** (`renderTick`): 500유닛 이동마다 state 업데이트로 래핑 갱신

---

## WallPlane.jsx

| 항목 | 값/설명 |
|------|---------|
| 패딩 | `MEDIA_PADDING = 6` → `boxW = mediaW + 12`, `boxH = mediaH + 12` |
| 지오메트리 | BoxGeometry (6면) |
| 앞면 머티리얼 | emissiveMap = 로드된 텍스처 |
| 측면 머티리얼 | `FRAME_COLOR = "#1a1a2e"` |
| 뒷면 머티리얼 | `BACK_COLOR = "#0a0a15"` |
| TV 깜박임 | 로드 후 0~1.2초 `flickerBrightness` 시퀀스 재생 |
| 이미지 로딩 | `getProxiedUrl(url)` → 프록시 경유 |
| manual 포커싱 | 클릭 시 `onManualFocus` 콜백 호출 |

---

## FocusClone.jsx

auto 포커싱 시 카메라 전방 `DISPLAY_OFFSET_Z` 거리에 렌더되는 클론 평면:

- 원본 평면과 동일한 텍스처 사용
- `fadeProgress` 에 따른 opacity 페이드인 (0 → 1)
- 스케일: `DISPLAY_SCALE = 0.8`
- DoubleSide 렌더링 (카메라 통과 시 뒤집힘 방지)

---

## MirrorReflection.jsx

포커싱 중(auto/manual) 바닥 아래에 렌더되는 반사 효과:

- 바닥 기준으로 Y축 π 회전 (뒤집기)
- opacity: `fadeProgress * 0.05` (매우 낮은 투명도, 은은한 효과)
- emissiveMap 사용으로 발광 효과
- 자연스러운 바닥 반사가 아님 — 단순 뒤집기 메시

---

## GlowBorder.jsx

auto 포커싱 중 원본 벽면 평면의 테두리를 강조하는 발광 효과:

- LineGeometry로 직사각형 테두리 구성 (`GLOW_POINTS_PER_EDGE` 포인트/변)
- PointLight: `intensity = fadeProgress * 2`
- 원본 평면의 position/rotation/scale에 맞춰 배치
- **auto 포커싱 전용** (manual 시 미표시)

---

## 현재 미완성 · 알려진 문제

1. **focusMode=auto**: 재생 중 포커싱이 지속적으로 트리거되지 않음 (카메라가 앞으로만 이동)
2. **focusMode=manual**: 벽면 평면이 카메라 앞으로 날아오는 비행 애니메이션 미완성
3. **MirrorReflection**: 자연스러운 바닥 반사 아님 (단순 뒤집기), 타이밍 불규칙
4. **video 타입 미디어**: 현재 `type === "image"`만 필터링 — video 지원 없음

---

## 유지보수 고려사항 & 개선 포인트

- **`PROXY_URL` 하드코딩** (constants.js) — 환경변수화 권장
- **텍스처 캐시 (`textureMap`) 메모리 누수** — 장시간 사용 시 dispose 전략 필요
- **강제 리렌더 (`renderTick`)** 500유닛마다 발생 — 래핑 갱신 목적이지만 불필요한 렌더 최소화 검토
- **video 타입 지원** — displayScene.jsx의 필터 로직 및 WallPlane 텍스처 훅 확장 필요
- **MirrorReflection 개선** — FBO/RenderTarget 기반 실제 반사로 교체 고려
