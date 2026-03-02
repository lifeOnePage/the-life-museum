# 앨범 편집 페이지 (`/library/edit/[record_id]`)

앨범 앞면(표지) / 뒷면(스토리·타임라인·테마)을 편집하는 페이지.

---

## 파일 구조

```
page.jsx                    # 편집 페이지 루트. 모든 상태 관리 및 저장 로직
components/
├── AlbumCover3D.jsx        # R3F 3D 앨범 미리보기 (video/image 텍스처 지원)
├── AlbumPreview3D.jsx      # AlbumCover3D를 감싸는 Canvas 래퍼
├── CoverImageEditor.jsx    # 표지 편집: AI 생성 + 직접 업로드
├── BioEditor.jsx           # 스토리 에디터
├── TimelineEditor.jsx      # 타임라인 에디터
├── ThemeSelector.jsx       # 테마 선택
└── ui/                     # shadcn/ui 컴포넌트
themeConfig.js              # UNIFIED_THEMES, DEFAULT_THEME 정의
```

---

## 저장 흐름 (`page.jsx`)

`handleSaveAll()`은 변경된 섹션만 병렬 저장한다.

| 섹션 | API | 담당 |
|------|-----|------|
| 표지 | `coverRef.current.save()` | `CoverImageEditor` 내부 |
| 스토리 | `PUT /api/v1/record/{id}/lifestory` | page.jsx의 `saveBio()` |
| 타임라인 | `PUT /api/v1/record/{id}/timeline` | page.jsx의 `saveTimeline()` |
| 테마/색상 | `PATCH /api/v1/record/{id}` | page.jsx의 `saveRecordColors()` |

---

## CoverImageEditor.jsx

### 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `generatedVideos` | `string[]` | AI 생성 비디오 URL 목록 (최대 3개) |
| `selectedVideoUrl` | `string \| null` | 적용된 AI 생성 비디오 URL |
| `selectedFile` | `File \| null` | 직접 업로드한 파일 |
| `selectedImageIndex` | `number` | 생성 결과 중 선택된 인덱스 |

`selectedVideoUrl`과 `selectedFile`은 상호 배타적 — 하나가 설정되면 다른 쪽은 `null`로 초기화.

### 생성 흐름 (`handleGenerate`)

```
FormData(prompt, [reference_image])
  → POST /api/v1/record/{id}/cover/generate   (X-Dev-Key 인증)
  → { data: { videos: [url1, url2, url3] } }
  → setGeneratedVideos(urls)
```

생성 소요 시간: 최대 2분 (Replicate minimax/video-01 폴링).
오류 시 `error` 상태에 메시지 표시.

### 적용 흐름 (`handleApply`)

```
generatedVideos[selectedImageIndex]
  → setSelectedVideoUrl(url)
  → setSelectedFile(null)
  → onImageGenerated(url)   ← page.jsx의 setFrontCover(url)
```

`onImageGenerated`는 3D 미리보기(`AlbumPreview3D`)에 즉시 반영된다.

### 저장 흐름 (`useImperativeHandle → save()`)

```
selectedVideoUrl 있음 → PUT  /api/v1/record/{id}/cover/url   { url }
selectedFile 있음    → POST /api/v1/record/{id}/cover/temp  FormData(file)
둘 다 없고 frontCover만 있음 → skip (이미 저장된 상태)
```

---

## AlbumCover3D.jsx — 텍스처

`AlbumCover.jsx` (라이브러리)와 동일한 패턴이나 GIF는 지원하지 않는다.

### 훅 체계

| 훅 | 동작 |
|----|------|
| `useStaticTexture(url)` | `THREE.TextureLoader` |
| `useVideoTexture(url)` | `THREE.VideoTexture` + Page Visibility API |
| `useAlbumTexture(url)` | 위 두 훅 분기 (`getMediaType` 기반) |

### `getMediaType(url)` 판별 기준

- `.gif` → `"gif"` (AlbumCover3D에서는 `"image"` 경로로 fallback)
- `.mp4` / `.webm` / `.mov` → `"video"`
- 그 외 → `"image"`

GIF URL이 들어오면 `type !== "video"`이므로 `useStaticTexture`로 전달된다.
(편집 화면에서 GIF 표지를 사용하려면 GIF 훅 추가 필요 — 현재 미구현)

---

## 인증

현재 모든 API 호출은 `X-Dev-Key: tlm2026` 헤더 사용.
백엔드 `get_current_user`는 이 키를 DB 첫 번째 유저로 매핑한다.
프로덕션 전환 시 `Authorization: Bearer <token>` 으로 변경 필요.

---

## 주의사항

- `coverRef`는 `forwardRef` + `useImperativeHandle`로 `save()` 메서드를 노출
- `isDirty` 계산 시 `frontCover`(URL)가 변경된 경우에만 `coverRef.current.save()` 호출
- AI 생성 영상은 R2에 이미 업로드된 URL이므로 `save()` 시 PUT 으로 DB에만 기록
- 직접 업로드 파일은 `save()` 시 실제 R2 업로드(POST)가 발생
