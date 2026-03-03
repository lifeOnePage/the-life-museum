# Library 페이지 (마이페이지)

사용자의 앨범 목록을 3D 선반 뷰로 보여주는 페이지.

---

## 파일 구조

```
app/library/
├── page.js
├── components/
│   ├── ShelfCanvas.jsx      # R3F Canvas 진입점 (카메라·조명·포스트프로세싱)
│   ├── ShelfScene.jsx       # 앨범 배치 레이아웃 + 상호작용
│   ├── AlbumCover.jsx       # 개별 앨범 3D 메시 + 텍스처
│   ├── Shelf.jsx            # 선반 판 메시
│   ├── Niche.jsx            # 벽감(아치 틀) 메시
│   ├── BlurLayer.jsx        # 배경 블러 (현재 비활성화)
│   ├── InfoBlock.jsx        # 헤더 + [새로 만들기] 버튼 영역
│   └── CreateAlbumModal.jsx # 앨범 생성 모달
└── utils/
    └── generateBackCover.js # 뒷면 커버 Canvas 생성
```

---

## 데이터 흐름

```
page.js
  └─ GET /api/v1/library
       └─ albums 상태 (최대 15개 보유)
            └─ ShelfCanvas에 전달 (최대 15개)
                 └─ ShelfScene이 앞 10개만 3D 렌더링
```

---

## API

### `GET /api/v1/library`

인증 필수 (`X-Dev-Key` 또는 `Bearer JWT`). 현재 사용자의 앨범 목록 반환.

실제 응답 필드:

| 필드 | 타입 | 비고 |
|------|------|------|
| `id` | string (UUID) | |
| `title` | string | |
| `subtitle` | string | |
| `coverImage` | `{ url: string }` \| null | R2 URL |
| `bgColor` | string \| null | 커버 배경색 |
| `color` | string \| null | 커버 전경색 |
| `keyColor` | string \| null | 테마 강조색 |
| `theme` | string \| null | |
| `lifestory` | string \| null | |
| `timeline` | object \| null | |
| `createdAt` | ISO 8601 string | |
| `updatedAt` | ISO 8601 string | |

### `POST /api/v1/record`

CreateAlbumModal에서 앨범 생성 시 사용. 성공 후 albums 상태에 새 앨범 추가.

### `GET /api/v1/record/{id}`

뒷면 커버 생성 시 `lifestory`, `timeline` 데이터 요청에 사용.

---

## 컴포넌트 트리 & 책임

```
page.js
├── ShelfCanvas
│   └── ShelfScene
│       ├── Niche (벽감)
│       ├── Shelf × 2 (선반 판)
│       └── AlbumCover × N (최대 10개)
├── InfoBlock (헤더 + [새로 만들기] 버튼)
└── CreateAlbumModal (조건부 렌더)
```

---

## page.js 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `albums` | `RecordListItem[]` | API 응답 전체 보유 |
| `selectedAlbum` | `RecordListItem \| null` | 클릭으로 포커싱된 앨범 |
| `isFlipped` | boolean | 앨범 뒤집힘 여부 |
| `hoverLabel` | string \| null | 호버 툴팁 텍스트 |
| `showCreateModal` | boolean | 생성 모달 표시 여부 |

### `generateBackCoverDataUrl(album)`

Canvas 1024×1024로 뒷면 커버 Data URL 생성:
- 왼쪽 영역: `lifestory` 텍스트
- 오른쪽 영역: `timeline` 항목 목록

---

## ShelfCanvas

| 항목 | 값 |
|------|----|
| 카메라 위치 | `[0, 1.5, 3.8]` |
| FOV | 52 |
| toneMapping | ACESFilmic (exposure 0.75) |

### 조명

| 종류 | 색상 | 강도 |
|------|------|------|
| AmbientLight | `#957A57` | 2 |
| DirectionalLight × 4 | `#D8BB95`, `#f5ede0` 혼합 | 각기 다름 |

### 포스트프로세싱

| 이펙트 | 주요 파라미터 |
|--------|--------------|
| N8AO | aoRadius=1, intensity=3 |
| Bloom | intensity=2 |
| Vignette | 선택적 활성화 |

---

## ShelfScene

레이아웃 상수:

| 상수 | 값 |
|------|----|
| ROWS | 2 |
| COLS | 5 |
| ALBUM_SIZE | 0.8 |
| ALBUM_GAP | 0.15 |
| SHELF_SPACING | 1.4 |
| tiltAngle | -0.15 rad (뒤로 기울기) |

앨범 배치: `startX` 기준으로 `col * (ALBUM_SIZE + ALBUM_GAP)` 간격 횡방향 배치.
응답 앨범 수만큼 채우되 최대 10개 렌더링.

---

## AlbumCover.jsx — 텍스처 (현행 유지)

`coverImage.url` 확장자에 따라 텍스처 로딩 방식 자동 선택.

### `getMediaType(url)`

```js
getMediaType("https://.../cover.gif")   // → "gif"
getMediaType("https://.../cover.mp4")   // → "video"
getMediaType("https://.../cover.jpg")   // → "image"
getMediaType(null)                       // → null
```

쿼리스트링(?)은 무시하고 경로 끝 확장자만 검사. `.webm`, `.mov`도 "video"로 처리.

### 텍스처 훅 체계

| 훅 | 입력 | 동작 |
|----|------|------|
| `useGifTexture(url)` | GIF URL | `gifuct-js`로 프레임 디코딩 → CanvasTexture |
| `useVideoTexture(url)` | 비디오 URL | `THREE.VideoTexture` + Page Visibility API |
| `useStaticTexture(url)` | 정적 이미지 URL | `THREE.TextureLoader` |
| `useAlbumTexture(url)` | 임의 URL | 위 세 훅을 분기 |

**훅 조건부 호출 금지 원칙**: `useAlbumTexture` 내부에서 세 훅을 항상 호출하되 비활성 경로에는 `null` 전달.

### `useVideoTexture` 주요 동작

- `document.createElement("video")` — `loop / muted / playsInline / crossOrigin`
- `canplay` 이벤트 시 `THREE.VideoTexture` 생성 후 `video.play()`
- `useFrame`에서 매 프레임 `texture.needsUpdate = true` (VideoTexture GPU 업로드)
- **Page Visibility API**: 탭 비활성 시 `video.pause()`, 복귀 시 `video.play()`
- cleanup: `video.pause() → video.src = "" → texture.dispose()`

---

## generateBackCover.js

Canvas 1024×1024 생성:
- 배경: `bgColor` (없으면 기본값)
- 왼쪽 영역: `lifestory` 텍스트 (줄바꿈 처리)
- 오른쪽 영역: `timeline` 항목 목록 (날짜 + 내용)
- 반환: `canvas.toDataURL("image/png")`

---

## 비활성화된 기능

| 기능 | 위치 | 비고 |
|------|------|------|
| BlurLayer | ShelfScene.jsx (주석) | FBO × 3 + GLSL Gaussian, 성능 이슈 |
| 카메라 줌/리셋 버튼 | ShelfCanvas.jsx (주석) | OrbitControls ref 메서드는 구현됨 |
| 선반 나무 텍스처 | Shelf.jsx | 미구현 |
| 앞면 립 (lip) | ShelfScene.jsx | 미구현 |
| Niche 아치형 상단 | Niche.jsx | 미구현 |

---

## 유지보수 고려사항 & 개선 포인트

- **앨범 10개 초과 시 페이징/검색 미구현** — 현재 최대 15개 보유, 10개만 렌더링
- **BlurLayer 재활성화 시** 성능 검토 필요 (FBO 3개, GLSL Gaussian blur)
- **Mybox/iCloud URL 입력 비활성화** — 연동 시 CreateAlbumModal 수정
- **VideoTexture 다수 앨범 동시 재생 시** 메모리 고려 (현재 Page Visibility API로 부분 완화)
