# 비디오 시스템 구현 상세 분석

## 1. 전체 아키텍처 개요

비디오는 **2-Tier 지연 로딩** 시스템으로 처리된다. 이미지와 달리 비디오는 디코딩, 네트워크 비용, GPU 텍스처 업데이트가 매 프레임 발생하므로 별도의 파이프라인을 갖는다.

```
소스 (Google Photos / iCloud / MyBox)
        ↓
백엔드: 스크래핑 → video_cache DB 조회
        ↓
   ┌─ cache hit (ready) → R2 최적화 URL (720p, faststart MP4)
   └─ cache miss → 원본 URL 반환 + 백그라운드 트랜스코딩 시작
        ↓
프론트엔드: SSE로 mediaList 수신
        ↓
Tier 1 (거리 2800) → poster 이미지 + 재생 아이콘 오버레이
        ↓
Tier 2 (거리 250)  → <video> 요소 생성, preload="none"
        ↓
포커스 트리거 → video.play() → HTTP Range 스트리밍
        ↓
매 프레임: VideoTexture.needsUpdate = true → GPU 텍스처 업로드
```

---

## 2. 이미지 vs 비디오: 로딩 시간 차이의 원인

### 이미지 로딩 (단순)

| 단계 | 소요 시간 | 설명 |
|------|-----------|------|
| HTTP 요청 | 50~200ms | proxy 경유, 1회 요청으로 전체 수신 |
| 디코딩 | 10~50ms | 브라우저 내장 JPEG/PNG 디코더 (하드웨어 가속) |
| Canvas 렌더링 | 20~50ms | 리사이즈 + 프레임 그리기 |
| GPU 업로드 | 5~10ms | CanvasTexture → GPU (1회) |
| **합계** | **~100~300ms** | |

### 비디오 로딩 (복잡)

| 단계 | 소요 시간 | 설명 |
|------|-----------|------|
| Tier 1: poster 로드 | 100~300ms | 이미지와 동일 |
| Tier 2 대기 | 0~5000ms | 동시 비디오 로드 제한 (최대 2개) → 슬롯 대기 |
| `<video>` 생성 + `video.load()` | 500~2000ms | HTTP 메타데이터 요청 (moov atom 파싱) |
| Proxy 이중 홉 | 100~400ms | Next.js proxy → 백엔드 proxy → 소스 |
| `loadeddata` 이벤트 대기 | 200~1000ms | 첫 프레임 디코딩 완료까지 |
| `video.play()` | 50~200ms | 오디오 컨텍스트 초기화, autoplay 정책 처리 |
| 매 프레임 GPU 업로드 | 지속적 | VideoTexture → GPU (30~60fps 반복) |
| **합계** | **~1~8초** | |

### 핵심 병목 원인 5가지

#### 병목 1: Tier 2 동시 로드 제한 (`MAX_CONCURRENT_VIDEO_LOADS = 2`)

```
Scene.jsx:39
const MAX_CONCURRENT_VIDEO_LOADS = 2;
```

이미지는 최대 30개 동시 로드가 가능하지만, 비디오는 **2개로 제한**된다. 비디오 3개째부터는 앞의 2개가 `loadeddata` 이벤트를 발생시킬 때까지 큐에서 대기한다. 비디오가 10개 있으면 마지막 비디오는 수 초간 대기할 수 있다.

#### 병목 2: Proxy 이중 홉

```
브라우저 → Next.js /api/proxy → 백엔드 /api/v1/scraper/proxy/image → 소스
```

Google Photos는 CORS 헤더(`Access-Control-Allow-Origin`)를 제공하지 않으므로, `<video>` 요소에서 직접 로드할 수 없다. 모든 비디오 요청이 proxy를 경유해야 하며, 현재 구조에서는 **2단 proxy**를 거치므로 왕복 지연이 100~400ms 추가된다.

#### 병목 3: Moov Atom 위치와 초기 버퍼링

MP4 파일의 moov atom(메타데이터)이 파일 **끝**에 위치하면, 브라우저는 재생 전 전체 파일을 다운로드해야 한다. 백엔드 트랜스코딩에서 `-movflags +faststart`를 적용하여 moov atom을 앞으로 옮기지만, **캐시 미스 시 원본 URL은 faststart가 아닐 수 있다**.

#### 병목 4: GPU 텍스처 매 프레임 업로드

```javascript
// WallPlane.jsx:761-762
if (!videoRef.current.paused) {
  videoTextureRef.current.needsUpdate = true;  // 매 프레임 실행
}
```

이미지는 GPU에 1회 업로드 후 끝이지만, 비디오는 **매 프레임마다** `<video>` 요소에서 현재 프레임을 읽어 GPU 텍스처로 업로드한다. 720p 기준 프레임당 ~2.7MB × 30fps = **~81MB/s GPU 대역폭**을 소비한다.

#### 병목 5: 백엔드 트랜스코딩 세마포어 (`Semaphore(2)`)

```python
# video_transcoder.py:27
_transcode_semaphore = asyncio.Semaphore(2)
```

서버에서 동시에 2개 비디오만 트랜스코딩 가능하다. 10개 비디오가 있는 앨범을 처음 열면, 캐시된 R2 URL이 없으므로 **원본 URL(느린 Google Photos =dv)로 재생**하면서 백그라운드에서 순차 트랜스코딩이 진행된다. 전부 완료까지 ~15분 이상 소요될 수 있다.

---

## 3. 비디오 로딩 시 일어나는 일: 단계별 상세 설명

### 3.1 단계 0: 페이지 진입 — 미디어 목록 수신

```
displayScene.jsx → useRecordData(recordId)
```

1. `GET /api/v1/record/{id}` → 앨범 메타데이터 수신
2. `GET /api/v1/record/{id}/media/stream` → SSE 스트리밍으로 mediaList 수신
3. 백엔드에서 Google Photos/iCloud/MyBox를 스크래핑하여 `MediaItem[]` 생성
4. 각 비디오 URL에 대해 `video_cache` DB 조회:
   - **cache hit** (`status="ready"`) → `original_url`을 R2 URL로 교체
   - **cache miss** → 원본 URL 유지 + `asyncio.create_task()`로 백그라운드 트랜스코딩 시작
5. SSE `type: "complete"` 이벤트로 최종 mediaList 전달

### 3.2 단계 1: Tier 1 — Poster 로딩 (카메라 거리 ≤ 2800)

```
WallPlane.jsx:280 — startPosterLoad()
```

1. **동시 로드 체크**: `activeLoadsRef.current >= 30`이면 다음 프레임으로 스킵
2. `activeLoadsRef.current++` (슬롯 점유)
3. `new Image()` 생성, `crossOrigin = "anonymous"` 설정
4. `img.src = getProxiedUrl(thumbnailUrl || imageUrl)` → proxy 경유 이미지 요청
5. `img.onload` 실행:
   - aspect ratio 계산 → 최대 텍스처 크기 제한 (데스크톱 1024, 모바일 768)
   - `document.createElement("canvas")` → 패딩(6px) 포함 캔버스 생성
   - 검정 배경(`#000000`) 칠한 뒤 이미지 그리기
   - **재생 아이콘 오버레이** 그리기 (반투명 원 + 삼각형):
     ```javascript
     // WallPlane.jsx:55-76 — drawPlayIcon()
     ctx.fillStyle = "rgba(255,255,255,0.7)";
     ctx.arc(cx, cy, r, 0, Math.PI * 2);  // 원
     ctx.moveTo(cx - triW/2, cy - triH/2);  // 삼각형
     ```
   - `new THREE.CanvasTexture(canvas)` 생성, SRGB 색공간 적용
   - material에 적용: `frontMatRef.current.map = tex`
6. `activeLoadsRef.current--` (슬롯 반환)
7. 상태: `"idle"` → `"poster_loaded"`

### 3.3 단계 2: Tier 2 — Video Element 생성 (포커스 접근 시)

```
WallPlane.jsx:380 — startDeferredVideoLoad()
```

**선행 조건**: Tier 1 완료 (`loadStateRef === "poster_loaded"`)

1. **비디오 동시 로드 체크**: `activeVideoLoadsRef.current >= 2`이면 스킵
2. `activeVideoLoadsRef.current++` (비디오 슬롯 점유)
3. `document.createElement("video")` 생성:
   ```javascript
   video.crossOrigin = "anonymous";
   video.muted = true;         // autoplay 정책 준수
   video.loop = false;
   video.playsInline = true;
   video.preload = "none";     // 메타데이터만, 데이터 다운로드 없음
   ```
4. **이벤트 리스너 등록**:
   - `loadeddata`: 메타데이터 + 첫 프레임 준비 완료 시
   - `error`: 로드 실패 시
5. `video.src = getProxiedUrl(imageUrl)` 설정
6. `video.load()` 호출 → 브라우저가 메타데이터 요청 시작

### 3.4 단계 3: Metadata 로드 완료 (`loadeddata` 이벤트)

```
WallPlane.jsx:402-440
```

1. `activeVideoLoadsRef.current--` (비디오 슬롯 반환)
2. `video.videoWidth`, `video.videoHeight` 읽기
3. `new THREE.VideoTexture(video)` 생성:
   ```javascript
   videoTex.colorSpace = THREE.SRGBColorSpace;
   videoTex.minFilter = THREE.LinearFilter;
   videoTex.magFilter = THREE.LinearFilter;
   videoTex.generateMipmaps = false;  // 비디오에는 mipmap 불필요
   ```
4. `videoElementMap.current.set(id, video)` — Scene에서 참조할 수 있도록 등록
5. 상태: `"video_loading"` → `"loaded"`
6. `onTextureLoaded({ isVideo: true, videoTexture, videoElement })` 콜백

### 3.5 단계 4: 재생 트리거

```
Scene.jsx:183-279 — startVideoPlayback(planeId)
```

**자동 포커스**: 카메라가 `OPACITY_PEAK_DIST`(130) 이내로 접근하면 자동 재생
**수동 포커스**: 사용자 클릭으로 트리거

1. `video.currentTime = 0` (처음부터 재생)
2. `video.muted = false` (소리 켜기 시도)
3. `video.play()` 호출
4. **Autoplay 정책 처리**:
   - 성공 → BGM 일시정지 (`onVideoBgmControl(true)`)
   - `NotAllowedError` → `video.muted = true`로 재시도
   - 재시도도 실패 → 재생 포기, 상태 초기화
5. `ended` 이벤트 리스너 등록 → 재생 종료 시 다음 포커스로 이동

### 3.6 단계 5: 매 프레임 텍스처 업데이트

```
WallPlane.jsx:761-762 (useFrame 루프 내)
```

```javascript
if (isVideoType && videoTextureRef.current && videoRef.current && !videoRef.current.paused) {
  videoTextureRef.current.needsUpdate = true;
}
```

Three.js는 `needsUpdate = true`가 설정된 프레임에서만 `<video>` 요소의 현재 프레임을 GPU 텍스처로 복사한다. 이 플래그를 **매 프레임** 설정해야 영상이 움직인다.

### 3.7 단계 6: 정리 및 해제

**원거리 해제** (카메라 거리 > 2200):
```javascript
// WallPlane.jsx:672-697
posterTextureRef.current.dispose();   // poster 텍스처 GPU 메모리 반환
videoTextureRef.current.dispose();    // video 텍스처 GPU 메모리 반환
video.pause();                       // 재생 중지
video.src = "";                      // 네트워크 요청 중단, 버퍼 해제
videoElementMap.current.delete(id);   // 참조 제거
loadStateRef.current = "idle";       // 다시 가까워지면 Tier 1부터 재시작
```

이미지는 3500 거리에서 해제, 비디오는 메모리 부담이 크므로 **2200 거리에서 조기 해제**한다.

---

## 4. 백엔드 비디오 트랜스코딩 파이프라인

### 트리거 시점

1. **앨범 생성 시** (`record.py`): Google Photos URL이 설정되면 즉시 `asyncio.create_task()`로 시작
2. **미디어 스크래핑 시** (`_apply_video_cache`): cache miss인 비디오 발견 시

### 트랜스코딩 과정

```python
# video_transcoder.py

async with _transcode_semaphore:  # 최대 2개 동시
    # 1. 다운로드 (httpx, 64KB 청크, 5분 타임아웃)
    await _download_video(url, tmp_input)

    # 2. FFmpeg 트랜스코딩
    ffmpeg -i input \
      -vf scale=-2:720 \        # 720p 리사이즈
      -c:v libx264 \            # H.264 코덱
      -crf 23 \                 # 품질 (0~51, 낮을수록 좋음)
      -preset fast \            # 인코딩 속도
      -movflags +faststart \    # moov atom을 파일 앞으로 → 스트리밍 가능
      -c:a aac -b:a 128k \     # 오디오
      -f mp4 output.mp4

    # 3. R2 업로드 (Cache-Control: 1년 immutable)
    s3.put_object(Key=f"videos/{uuid}.mp4", CacheControl="public, max-age=31536000, immutable")

    # 4. DB 업데이트 (status: "processing" → "ready")
```

### URL 해싱 (중복 방지)

```python
def compute_source_url_hash(url):
    base = url.split("=")[0]  # Google Photos의 =dv 파라미터 제거
    return hashlib.sha256(base.encode()).hexdigest()
```

같은 사진의 `=dv`(다운로드), `=w1024`(리사이즈) 등 다른 파라미터가 붙어도 동일 해시로 인식된다.

---

## 5. HTTP Range 스트리밍 구조

현재 구현은 HLS/DASH가 아닌 **HTTP Range Request 기반 Progressive Streaming**이다.

```
브라우저 <video>
  ↓ Range: bytes=0-65535
/api/proxy?url=<R2 URL>
  ↓ Range 헤더 전달
R2 (또는 Google Photos)
  ↓ 206 Partial Content + Content-Range: bytes 0-65535/12345678
브라우저
  ↓ 추가 Range 요청으로 필요한 구간만 가져옴
```

`-movflags +faststart` 덕분에 파일 앞부분의 moov atom만 읽으면 재생을 시작할 수 있고, 브라우저가 필요한 구간만 Range 요청으로 가져온다.

---

## 6. 성능 개선 가능 사항

### 개선 1: Proxy 이중 홉 제거 (영향: 높음)

**현재**: 브라우저 → Next.js proxy → 백엔드 proxy → 소스 (3홉)
**개선**: R2에 캐시된 비디오는 R2 URL을 직접 사용 (1홉)

R2는 CORS를 지원하므로, 캐시된 R2 URL에는 proxy가 필요 없다. cache hit인 비디오만 `getProxiedUrl()`을 건너뛰면 **100~400ms 절감**.

```javascript
// 개선안: R2 URL은 proxy 불필요
function getVideoUrl(url) {
  if (url.includes("r2.dev/")) return url;  // R2 직접 접근
  return getProxiedUrl(url);                 // 원본은 proxy 경유
}
```

### 개선 2: 비디오 동시 로드 수 적응형 조정 (영향: 중간)

**현재**: `MAX_CONCURRENT_VIDEO_LOADS = 2` 고정
**개선**: 디바이스 성능에 따라 동적 조정

```javascript
// 개선안
const MAX_CONCURRENT_VIDEO_LOADS = navigator.hardwareConcurrency >= 8 ? 4 : 2;
```

고사양 디바이스에서는 Tier 2 병목이 절반으로 줄어든다.

### 개선 3: 비디오 poster에 실제 썸네일 사용 (영향: 중간)

**현재**: 원본 이미지를 Canvas로 그린 뒤 재생 아이콘 오버레이
**개선**: 백엔드 트랜스코딩 시 FFmpeg로 썸네일 추출하여 R2에 별도 저장

```bash
ffmpeg -i input.mp4 -ss 00:00:01 -frames:v 1 -q:v 2 thumbnail.jpg
```

이렇게 하면 Tier 1에서 비디오 원본 URL에 접근할 필요 없이 가벼운 썸네일 URL로 빠르게 poster를 표시할 수 있다.

### 개선 4: 트랜스코딩 세마포어 확대 + 워커 분리 (영향: 높음)

**현재**: `Semaphore(2)`, 앱 서버에서 직접 FFmpeg 실행
**개선안**:
- 세마포어를 서버 CPU 코어 수에 맞게 조정
- 또는 트랜스코딩을 별도 워커(Celery, Cloud Run Job 등)로 분리

10개 비디오 기준 현재 ~15분 → 워커 4개면 ~7분으로 단축.

### 개선 5: 캔버스 백킹 스토어 해제 (영향: 낮음)

**현재**: poster용 Canvas 생성 후 CanvasTexture가 GPU에 업로드되어도 Canvas 객체가 메모리에 남음
**개선**: GPU 업로드 후 Canvas 크기를 0으로 설정하여 백킹 스토어 해제

```javascript
const tex = new THREE.CanvasTexture(canvas);
tex.needsUpdate = true;
// GPU 업로드 후 Canvas 메모리 해제
canvas.width = 0;
canvas.height = 0;
```

30개 텍스처 기준 ~30~60MB 메모리 절감 가능.

### 개선 6: 비디오 로드 실패 시 재시도 로직 (영향: 낮음)

**현재**: 비디오 로드 실패 시 poster 상태로 돌아가고 재시도 없음
**개선**: 지수 백오프 재시도 (최대 2~3회)

```javascript
// 현재: loadStateRef.current = "poster_loaded" (재시도 없음)
// 개선: 재시도 카운터 + 다음 proximity check에서 재시도
if (retryCount < 3) {
  retryCount++;
  setTimeout(() => { loadStateRef.current = "poster_loaded"; }, 2000 * retryCount);
}
```

---

## 7. 요약: 비디오 로딩 타임라인 (worst case)

```
t=0.0s  페이지 진입, SSE 스크래핑 시작
t=1.0s  mediaList 수신 완료 (비디오 10개 포함, 모두 cache miss)
t=1.0s  백그라운드 트랜스코딩 시작 (2개씩 순차)
t=1.5s  Tier 1: 비디오 poster 30개 중 일부 로드 시작 (이미지와 경합)
t=2.5s  Tier 1: poster 로드 완료 (재생 아이콘 표시)
t=3.0s  카메라 접근 → Tier 2: video element 생성 (슬롯 1/2)
t=3.5s  proxy 경유 메타데이터 요청 (moov atom 파싱)
t=4.5s  loadeddata → VideoTexture 생성
t=5.0s  자동 포커스 트리거 → video.play()
t=5.2s  Range 요청으로 첫 청크 수신 → 재생 시작
t=5.2s~ 매 프레임 VideoTexture.needsUpdate = true → GPU 업로드
        ...
t=15m   백그라운드 트랜스코딩 전체 완료
        (이후 재방문 시 R2 캐시 URL 사용 → 로딩 시간 대폭 단축)
```
