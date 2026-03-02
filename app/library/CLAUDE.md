# Library 페이지

해당 디렉토리는 서비스가 유저에게 마이페이지와 같은 기능을 제공합니다.
개요:

1. {baseurl}/api/v1/library 으로 마이페이지 렌더링에 필요한 데이터 요청(GET)
2. response:
   {
   "ok": true,
   "code": 200,
   "message": "Success",
   "data": [
   {
   "id": "ffee13ba-21a0-4436-a3d3-4e681d493221",
   "title": "굉장나엄청해",
   "subtitle": "서브굉장나엄청해",
   "coverImage": null,
   "createdAt": "2026-02-10T22:54:36.312538Z",
   "updatedAt": "2026-02-10T22:54:36.312538Z"
   },
   {
   "id": "c1111111-1111-1111-1111-111111111111",
   "title": "할머니의 추억 앨범",
   "subtitle": "1950-2020 함께한 시간",
   "coverImage": {
   "url": "https://pub-d32dad1fbd3c41ce95fdd4f40e7efa44.r2.dev/covers/8ee8e9d8-1b20-4a99-b6cd-b19fdde0969f.jpg"
   },
   "createdAt": "2026-02-10T22:34:04.563511Z",
   "updatedAt": "2026-02-10T22:34:04.563511Z"
   },
   {
   "id": "c2222222-2222-2222-2222-222222222222",
   "title": "아버지의 인생 기록",
   "subtitle": "소중한 순간들",
   "coverImage": null,
   "createdAt": "2026-02-10T22:34:04.563511Z",
   "updatedAt": "2026-02-10T22:34:04.563511Z"
   }
   ]
   }

3. 현재 3d의 2\*5 규격을 따르되 실제응답에서 온 개수만큼 렌더링해야합니다. 10개 미만일 경우 첫째줄부터 횡방향으로 먼저 채우는 식으로 앨범판을 배치하고, 10개 초과일 경우 10개까지만 배치하세요(나머지 앨범정보는 내부적으로 들고 있다가 검색 또는 페이지 넘기기(추후에 구현할 예정)를 수행하면 그때 렌더링합니다. 즉 11번째 이후 앨범판 정보도 계속 들고 있어야함)

4. 커버이미지는 현재 구현된 렌더링 화면에서 각 앨범판의 앞면 텍스쳐로 입히세요. null이거나 valid image가 아닐경우 에러나지 않도록 예외처리하고 따로 텍스쳐를 입히지 않습니다.

5. 현재 구현에서 각 앨범을 클릭하면 해당 앨범에 포커싱 상태를 맞추고, 앞으로 나오는 애니메이션이 적용되어있습니다. 이를 그대로 유지하면서 "보러가기" 버튼을 누르면 /walk/[id] 으로 네비게이션하도록 하세요.

--

R3F 애니메이션: 앨범판 포커싱 중일때 앨범판 바깥을 누르면 X 버튼을 누른것과 마찬가지로 앨범판을 제자리에 두세요.
DOM 요소: 포커싱 중일때 앨범 제목 및 설명은 앨범판 왼쪽에, 편집하기 및 보러가기 버튼은 앨범판 아래에 양옆 나란히 배치하세요.

--

library 페이지에서 InfoBlock 컴포넌트 우상단에 [새로 만들기] 버튼을 놓으세요.
클릭시 앨범을 새로 생성하기 위한 모달이 등장해야합니다.
모달에서는 앨범 제목, 설명, googlePhotoUrl, mybox url(현재는 입력폼을 표시만 하고 입력은 비활성화), icloud url(현재는 입력폼을 표시만 하고 입력은 비활성화) 입력을 받습니다.
/api/v1/record로 POST 요청을 보내면 앨범을 새로 생성하고, library 화면의 3d 그래픽에 해당 추가가 반영됩니다.

---

## AlbumCover.jsx — 미디어 타입 및 텍스처

`components/AlbumCover.jsx`는 R3F(React Three Fiber) 기반 3D 앨범 표지 컴포넌트로,
커버 URL의 확장자에 따라 텍스처 로딩 방식을 자동 선택한다.

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
| `useAlbumTexture(url)` | 임의 URL | 위 세 훅을 조건부로 분기 |

**훅 조건부 호출 금지 원칙**: React 훅 규칙상 조건부 호출 불가 →
`useAlbumTexture` 내부에서 세 훅을 항상 호출하되 비활성 경로에는 `null`을 전달한다.

### `useVideoTexture` 주요 동작

- `document.createElement("video")` — `loop / muted / playsInline / crossOrigin`
- `canplay` 이벤트 시 `THREE.VideoTexture` 생성 후 `video.play()`
- `useFrame` 에서 매 프레임 `texture.needsUpdate = true` (VideoTexture GPU 업로드)
- **Page Visibility API**: 탭 비활성 시 `video.pause()`, 복귀 시 `video.play()`
- cleanup: `video.pause() → video.src = "" → texture.dispose()`

### R2 저장 경로와의 연동

커버 URL은 항상 `covers/{uuid}.{ext}` 형태로 저장된다.
`getMediaType`은 이 확장자를 보고 타입을 결정하므로 **R2 업로드 시 올바른 확장자 사용 필수**.
AI 생성 영상 → `.mp4`, 이미지 → `.jpg`/`.png` 등.
