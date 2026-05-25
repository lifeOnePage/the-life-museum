중요: 이 요청은 바로 코드를 작성하는 작업이 아니라, 먼저 기존 코드와 에셋을 조사하고 구현 계획을 수립한 뒤 질문해야 하는 작업이다. 추측으로 구현하지 말고, 실제 파일을 확인한 내용과 불확실한 내용을 분리해서 보고하라.

너는 Next.js App Router 기반 프로젝트의 프론트엔드/인터랙션 구현을 담당하는 시니어 개발자다.

현재 프로젝트는 다음 경로에 있다.

- 프로젝트 루트: `/Users/ihyeonseo/Desktop/2025/tlm/the-life-museum`
- 기존 앨범 전시 페이지: `/Users/ihyeonseo/Desktop/2025/tlm/the-life-museum/app/walk`
- 새로 만들 전시 페이지: `/Users/ihyeonseo/Desktop/2025/tlm/the-life-museum/app/vhs`

목표는 기존 `/walk` 전시 페이지의 다른 버전으로, 3D를 사용하지 않는 VHS 감상형 전시 페이지를 만드는 것이다.

이 작업은 단순 페이지 추가가 아니라, library에서 특정 앨범을 선택한 뒤 “보러가기”를 눌렀을 때 해당 앨범의 전시 타입에 따라 `/walk` 또는 `/vhs`로 이동하는 구조까지 고려해야 한다.

단, 현재 데이터베이스의 record 테이블에는 전시 타입을 구분하는 컬럼이 아직 없다. 따라서 구현 전에 기존 데이터 구조, record 관련 Prisma/schema/API/library routing 로직을 먼저 조사하고, 어떤 컬럼과 enum을 추가하는 것이 적절한지 계획해야 한다. 임의로 마이그레이션을 실행하거나 기존 데이터를 파괴하는 변경은 하지 말 것.

---

# 1. 먼저 반드시 조사할 것

바로 구현하지 말고, 아래 항목을 먼저 확인한 뒤 계획을 제안하라.

## 1-1. `/app/walk`의 구조

다음을 확인하라.

- 어떤 route 구조인지
- recordId 또는 albumId를 어떻게 받는지
- 앨범 데이터, lifestory, media contents를 어디서 가져오는지
- 컨트롤 버튼 UI가 어디에 구현되어 있는지
- 재사용 가능한 컴포넌트가 있는지
- `/vhs` 구현 시 그대로 재사용할 수 있는 데이터 로딩 로직이 있는지

## 1-2. library 화면의 “보러가기” 이동 로직

다음을 확인하라.

- 현재 특정 앨범 클릭 후 어떤 방식으로 `/walk`에 진입하는지
- record 데이터가 어디에서 로드되는지
- “보러가기” 버튼 클릭 핸들러가 어디에 있는지
- routing을 어디에서 분기해야 하는지
- 현재 record 객체가 routing 시점에 충분한 정보를 가지고 있는지

## 1-3. record 데이터 모델

다음을 확인하라.

- 현재 record 테이블 또는 관련 모델 구조
- title, lifestory, media contents가 어떤 필드/관계로 구성되어 있는지
- 전시 타입 컬럼을 추가한다면 어떤 이름이 자연스러운지
  - 예: `exhibitionType`
  - 예: `displayType`
  - 예: `viewType`
- enum을 쓴다면 어떤 값이 적절한지
  - 예: `WALK`
  - 예: `VHS`
- 기존 데이터에 안전한 default 값을 어떻게 줄 수 있는지

## 1-4. VHS 관련 public assets 존재 여부

다음 파일이 실제로 존재하는지 확인하라.

- `/public/vhs/vhs-tape-detail-no-title-desktop.png`
- `/public/vhs/tv-vhs-insert-animation.mp4`
- `/public/vhs/tv-off-desktop.png`
- `/public/vhs/tv-playback-family-time-desktop.png`
- `/public/vhs/tv-static-loop.mp4`

파일이 없거나 이름이 다르면 구현 전에 보고하라.

## 1-5. 첨부한 storyboard 이미지 분석

첨부된 storyboard 이미지를 기준으로 사용자 경험을 설계하라.

특히 다음 흐름을 반영할 것.

- #01 VHS 테이프 화면
- #02 TV playback 화면
- #03 photo frame 화면
- 모바일 세로 버전

이미지의 정확한 레이아웃을 기준으로 텍스트와 media viewport 위치를 잡아야 하므로, 단순히 화면 중앙에 요소를 배치하지 말 것.

---

# 2. 최종 사용자 시나리오

library 화면에서 특정 앨범을 클릭한 뒤 “보러가기” 버튼을 누른다.

해당 record의 전시 타입이 “기억 테이프” 또는 `VHS`라면 `/vhs` 화면으로 이동한다.

현재는 이 전시 타입 데이터가 없으므로, 우선 다음 구현 계획을 제안해야 한다.

- record 테이블에 `exhibitionType` 컬럼 추가
- 기본값은 기존 전시 방식인 `WALK`
- VHS 전시용 record만 `VHS`로 설정
- library의 “보러가기” 클릭 시 `record.exhibitionType`에 따라 라우팅 분기

예상 분기 로직은 다음과 같다.

```ts
if (record.exhibitionType === "VHS") {
  router.push(`/vhs/${record.id}`);
} else {
  router.push(`/walk/${record.id}`);
}
```

단, 실제 route 구조는 기존 프로젝트를 확인한 뒤 맞출 것.

---

# 3. `/vhs` 화면의 전체 UX 흐름

VHS 화면은 크게 네 단계로 구성된다.

---

## Step 1. VHS 테이프 상세 화면

사용 asset:

- `/public/vhs/vhs-tape-detail-no-title-desktop.png`

요구사항:

- 이미지를 전체 화면에 꽉 차게 배경으로 표시
- 화면이 하나의 완성된 VHS 테이프 오브젝트처럼 보여야 함
- 이미지 위에 텍스트가 어색하게 떠 있는 느낌이 나면 안 됨
- 이미지의 빈 공간에 정확히 맞춰 다음 정보를 배치

배치할 정보:

1. 상단 여백 영역
   - 해당 record album의 `lifestory`
   - 너무 길 경우 줄 수 제한 또는 자연스러운 fade/scroll 처리 고려

2. 중앙 테이프 라벨의 빈칸 영역
   - 해당 record album의 title

3. 하단 영역
   - “재생하기” 버튼

중요:

- 텍스트 위치는 고정 px만으로 박지 말고, 화면 비율과 asset의 실제 구도를 기준으로 responsive하게 계산할 것
- desktop 기준으로 먼저 구현하되, storyboard의 mobile 세로 버전도 확장 가능하도록 구조화할 것
- 배경 이미지는 `object-fit: cover` 또는 `contain` 중 실제 asset 비율에 맞는 방식을 선택하되, 잘림으로 인해 텍스트 위치가 어긋나지 않도록 주의할 것
- 텍스트와 버튼은 VHS 이미지의 일부처럼 자연스럽게 보여야 함

---

## Step 2. VHS 삽입 애니메이션

사용 asset:

- `/public/vhs/tv-vhs-insert-animation.mp4`

동작:

- 사용자가 “재생하기” 버튼을 누르면 전체 화면으로 이 비디오를 재생
- 비디오는 한 번만 재생
- 비디오가 끝나면 다음 Step으로 이동

중요:

- Step 1의 이미지에서 Step 2의 비디오로 넘어갈 때 에셋이 바뀌었다는 느낌이 들면 안 됨
- 필요하다면 fade, opacity crossfade, poster frame, background color matching 등을 사용해 자연스럽게 연결할 것
- 비디오 로딩 중 검은 화면이나 흰 화면이 튀어나오지 않도록 preload/poster 전략을 세울 것
- 사용자가 재생 버튼을 누른 직후 영상이 늦게 떠서 경험이 끊기지 않도록 사전 로딩을 고려할 것

---

## Step 3. 꺼진 TV 화면

사용 asset:

- `/public/vhs/tv-off-desktop.png`

동작:

- VHS 삽입 애니메이션이 끝난 직후 꺼진 TV 화면을 표시
- 아주 짧은 정지 상태를 둔 뒤 TV가 켜지는 장면으로 넘어갈 것
- 이때도 비디오에서 이미지로 넘어가는 단절감이 없어야 함

중요:

- tv-off 이미지와 이전 영상의 마지막 프레임이 자연스럽게 연결되는지 확인할 것
- 필요하다면 짧은 fade-in/fade-out 또는 opacity transition 적용
- 화면 크기, 배경색, 이미지 스케일이 갑자기 바뀌지 않도록 할 것

---

## Step 4. TV playback 화면 + static effect + album contents slideshow

사용 assets:

- TV 프레임 이미지:
  - `/public/vhs/tv-playback-family-time-desktop.png`
- TV static loop:
  - `/public/vhs/tv-static-loop.mp4`

동작:

1. TV playback 프레임 이미지를 전체 화면 배경으로 표시
2. TV 화면 중앙의 구멍난 영역에 `tv-static-loop.mp4`를 먼저 표시
3. static effect가 짧게 재생된 뒤, record album에서 가져온 media contents를 차례대로 표시
4. 사진은 설정된 시간만큼 보여주고 다음 콘텐츠로 이동
5. 영상은 기본적으로 끝까지 재생한 뒤 다음 콘텐츠로 이동
6. 콘텐츠가 끝나면 다시 처음부터 반복하거나, 종료 화면을 둘지 여부는 먼저 질문할 것

중요:

- media content는 TV 프레임 안쪽 화면 영역에 정확히 맞춰 들어가야 함
- TV 프레임 이미지는 배경이고, 실제 사진/영상은 그 위 또는 아래 레이어에 위치시켜야 함
- TV 화면 내부 영역의 좌표와 크기는 asset 비율 기준으로 계산할 것
- object-fit은 기본적으로 `cover`를 고려하되, 인물 사진이 잘리는 문제가 크면 `contain` 옵션도 고려할 것
- TV 프레임의 둥근 모서리, 화면 왜곡, 노이즈 느낌을 해치지 않도록 overflow hidden / border-radius / mask 처리 고려
- TV 화면 내부 영역은 추후 transition 구현의 기준 좌표계가 되므로 별도 컴포넌트로 분리할 것

---

# 4. Slideshow / Playback 규칙

record album에서 가져온 콘텐츠를 순서대로 재생한다.

콘텐츠 타입:

- image
- video

## 사진 재생 규칙

- 사진 하나당 표시 시간은 유저가 선택 가능
- 기본값은 5초
- 선택 가능 값 예시:
  - 1초
  - 3초
  - 5초
  - 10초

## 영상 재생 규칙

- 기본값은 전체 재생 후 다음 콘텐츠로 이동
- 옵션으로 “짧게 보기” 모드를 제공
- 짧게 보기 모드일 경우 영상마다 지정된 초만큼만 재생하고 다음 콘텐츠로 이동
- 선택 가능 값 예시:
  - 전체 재생
  - 3초
  - 5초
  - 10초

## 콘텐츠 전환

- 현재 바로 구현할 transition은 최소한의 fade 정도로 처리해도 됨
- 다만 추후 다음 transition을 추가할 예정이므로 구조를 확장 가능하게 만들 것
  - `kenburn`
  - `fade-in-out`

중요:

- transition 구현을 염두에 두고, 현재 콘텐츠와 다음 콘텐츠를 단순히 교체하지 말 것
- 추후 transition을 위해 current item / next item을 동시에 렌더링할 수 있는 구조를 고려할 것
- kenburn 효과의 경우 사진 자체가 TV 프레임 내부에서 scale/translate되며 움직여야 하므로, TV viewport 내부 좌표계를 명확히 분리할 것
- media item 변경, transition, video ended, image timer가 서로 충돌하지 않도록 state machine 또는 명확한 hook 구조로 관리할 것

---

# 5. 상단 컨트롤 UI

기존 `/walk`의 컨트롤 버튼 스타일과 구조를 참고한다.

VHS 화면 상단에는 다음 컨트롤을 배치한다.

## 5-1. 사진 표시 시간 드롭다운

옵션:

- 1초
- 3초
- 5초
- 10초

## 5-2. 영상 재생 방식 드롭다운

옵션:

- 전체 재생
- 짧게 보기 3초
- 짧게 보기 5초
- 짧게 보기 10초

## 5-3. 추후 추가 예정인 transition 옵션 드롭다운

지금 당장 완성 구현하지 않아도 되지만, UI 또는 구조상 확장 가능하게 설계한다.

예정 옵션:

- kenburn
- fade-in-out

컨트롤 UI 요구사항:

- TV 감상 경험을 해치지 않도록 너무 튀지 않게 배치
- 필요할 때만 보이거나, hover/focus 시 강조되는 방식 고려
- 모바일에서는 세로 화면을 가리지 않도록 compact하게 구성
- 기존 `/walk`의 컨트롤 UI와 시각적 언어가 크게 다르지 않게 맞출 것

---

# 6. 구현 품질 기준

다음 기준을 만족해야 한다.

1. 에셋 전환이 자연스러울 것
   - image → video
   - video → image
   - static video → media slideshow

2. 검은 화면, 흰 화면, 레이아웃 점프가 보이지 않을 것

3. 모든 비디오 asset은 필요한 시점 전에 preload할 것

4. 전체 화면 경험이 깨지지 않을 것
   - body margin 제거
   - viewport 기준 100vw / 100vh
   - overflow 처리

5. TV 내부 콘텐츠 영역은 asset 비율에 맞춰 정확히 계산할 것

6. `/walk`의 기존 데이터 로딩 방식과 최대한 일관되게 구현할 것

7. 3D, Three.js, R3F는 사용하지 말 것

8. 기존 `/walk` 기능을 깨뜨리지 말 것

9. 기존 DB 데이터가 손상되지 않도록 migration 계획을 먼저 제안할 것

10. 서버 컴포넌트 / 클라이언트 컴포넌트 경계를 명확히 할 것

11. video element의 autoplay, muted, playsInline, preload 속성을 모바일 브라우저 제약까지 고려해서 설정할 것

12. 이미지와 비디오 asset의 로딩 상태를 고려해 사용자가 빈 화면을 보지 않도록 할 것

---

# 7. 권장 컴포넌트 구조

실제 프로젝트 구조를 확인한 뒤 조정해도 되지만, 우선 다음과 같은 분리를 고려하라.

```txt
app/vhs/
  [recordId]/
    page.tsx 또는 page.jsx
    components/
      VHSTapeIntro.tsx
      VHSInsertScene.tsx
      TVOffScene.tsx
      TVPlaybackScene.tsx
      TVMediaViewport.tsx
      VHSControls.tsx
    hooks/
      useVHSPlayback.ts
      useMediaSlideshow.ts
    utils/
      vhsViewport.ts
      mediaTiming.ts
```

각 역할:

## `VHSTapeIntro`

- VHS 테이프 배경 표시
- lifestory/title/play button 표시
- play button 클릭 시 다음 scene으로 전환

## `VHSInsertScene`

- 삽입 애니메이션 비디오 재생
- ended 이벤트 후 다음 scene으로 전환
- 비디오 preload/poster 처리

## `TVOffScene`

- 꺼진 TV 이미지 표시
- 짧은 delay 후 playback scene으로 전환

## `TVPlaybackScene`

- TV 프레임 배경 표시
- static effect 표시
- media slideshow 시작
- 상단 컨트롤 UI 포함

## `TVMediaViewport`

- TV 화면 내부 영역에 실제 image/video 렌더링
- 추후 transition 구현의 중심 컴포넌트
- current item / next item 동시 렌더링 구조 고려

## `VHSControls`

- 사진 표시 시간 설정
- 영상 재생 방식 설정
- 추후 transition 옵션 설정

## `useVHSPlayback`

- scene state 관리
- intro / insert / off / playback 단계 전환

## `useMediaSlideshow`

- media index 관리
- image timer 관리
- video ended 처리
- short video mode 처리
- loop 여부 처리

## `vhsViewport.ts`

- asset 비율 기준 TV 내부 viewport 좌표 계산
- desktop/mobile 좌표 분리 가능하게 설계

## `mediaTiming.ts`

- image duration
- video short mode
- transition duration
- static duration 등의 timing 상수 관리

---

# 8. scene state 설계

다음과 같은 scene 상태를 고려하라.

```ts
type VHSScene = "intro" | "insert" | "tvOff" | "static" | "playback";
```

예상 흐름:

1. `intro`
   - VHS tape image 표시
   - title, lifestory, play button 표시

2. `insert`
   - `tv-vhs-insert-animation.mp4` 한 번 재생

3. `tvOff`
   - `tv-off-desktop.png` 짧게 표시

4. `static`
   - `tv-playback-family-time-desktop.png` 배경
   - TV 내부에 `tv-static-loop.mp4` 짧게 표시

5. `playback`
   - TV 내부에 record media contents 순차 표시

실제 구현에서는 `static`을 `TVPlaybackScene` 내부 phase로 둘 수도 있다. 단, 상태 전환이 명확해야 한다.

---

# 9. media slideshow 로직

media item은 다음과 같은 형태로 정규화해서 다루는 것을 고려하라.

```ts
type VHSMediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  title?: string;
  caption?: string;
  duration?: number;
};
```

이미지 처리:

- `imageDuration` 값에 따라 timer 설정
- timer 종료 시 다음 item으로 이동

비디오 처리:

- 기본 모드에서는 `onEnded` 이벤트로 다음 item 이동
- short mode에서는 지정 초가 지나면 pause 후 다음 item 이동
- video 로딩 전 빈 화면이 뜨지 않도록 `onCanPlay` 또는 loading state 처리

루프 처리:

- 마지막 item 이후 처음으로 돌아갈지
- 마지막 item에서 멈출지
- 이 부분은 구현 전에 사용자에게 질문할 것

---

# 10. responsive / asset alignment 전략

이 구현의 핵심은 asset 위에 요소를 정확하게 얹는 것이다.

따라서 다음 전략을 고려하라.

1. 전체 화면 wrapper는 viewport를 꽉 채운다.

```css
width: 100vw;
height: 100vh;
overflow: hidden;
position: relative;
```

2. 배경 asset은 화면 비율과 asset 비율을 비교해 실제 렌더링된 이미지 영역을 계산한다.

3. 텍스트와 media viewport는 단순 viewport 기준이 아니라, 실제 렌더링된 asset box 기준의 percentage 좌표로 배치한다.

4. TV 내부 media viewport는 다음 값을 별도 상수로 관리한다.

```ts
const TV_VIEWPORT_DESKTOP = {
  x: 0.0,
  y: 0.0,
  width: 0.0,
  height: 0.0,
};
```

위 값은 실제 asset을 보고 조정할 것. 임의 값으로 확정하지 말고, 먼저 asset을 확인한 뒤 제안하라.

5. 모바일 세로 버전은 별도 asset이 있는지 확인하고, 없다면 desktop asset을 세로 화면에 어떻게 대응할지 계획을 제안하라.

---

# 11. 구현 전에 반드시 답변해야 할 질문

구현 전에 반드시 아래 내용을 확인하고, 모호한 부분은 질문하라.

1. `/vhs` route는 `/vhs/[recordId]` 형태로 만들면 되는가?

2. record의 전시 타입 컬럼명은 `exhibitionType`으로 해도 되는가?

3. enum 값은 `WALK`, `VHS`로 해도 되는가?

4. VHS 콘텐츠 재생이 끝난 뒤에는 처음부터 반복할지, 마지막 화면에서 정지할지?

5. 모바일 세로 버전도 이번 구현 범위에 포함할지, 아니면 desktop 우선으로 구현할지?

6. TV 화면 안쪽 media viewport는 storyboard 기준으로 정확히 맞추면 되는지, 아니면 asset을 분석해서 좌표를 별도로 조정해야 하는지?

7. 사진/영상의 원본 비율은 `cover`로 꽉 채우는 것이 우선인지, `contain`으로 전체를 보여주는 것이 우선인지?

8. lifestory가 길 경우 몇 줄까지 보여줄지, 또는 스크롤/페이드 처리할지?

9. static effect는 매 콘텐츠 전환마다 넣을지, TV가 켜질 때 한 번만 넣을지?

10. VHS 전시 타입을 기존 record에 수동으로 넣을지, 관리자 UI 또는 생성 플로우에서도 선택 가능하게 할지?

11. `photo frame` 형태의 별도 화면은 이번 구현 범위에 포함되는지, 아니면 우선 TV playback 중심으로 구현할지?

---

# 12. 작업 방식

바로 구현하지 말고 다음 순서로 진행하라.

1. 관련 파일 구조 탐색
2. `/walk`와 library routing 방식 분석
3. record 데이터 모델 분석
4. VHS asset 존재 여부 확인
5. storyboard 기준 UI/scene 요구사항 정리
6. 구현 계획 작성
7. 불확실한 부분 질문
8. 사용자가 확인한 뒤 구현 진행

답변에는 다음을 포함하라.

- 현재 프로젝트에서 확인한 관련 파일 목록
- `/walk`의 데이터 흐름 요약
- library → exhibition page 이동 구조 요약
- DB/schema 변경 제안
- `/vhs` 구현 컴포넌트 설계
- scene state 흐름도
- media slideshow 로직
- responsive/asset alignment 전략
- 구현 전에 확인이 필요한 질문

---

# 13. 금지사항

다음은 하지 말 것.

- 기존 `/walk` 페이지를 깨뜨리는 변경
- 기존 record 데이터를 파괴할 수 있는 migration 실행
- 실제 파일 확인 없이 route 구조를 추측해서 구현
- 이미지 위 위치를 단순 px 값으로 대충 배치
- 3D, Three.js, R3F 사용
- 비디오 로딩 중 검은 화면 또는 흰 화면 방치
- asset이 없는 상태에서 있다고 가정하고 구현
- 사용자가 확인하지 않은 DB schema 변경을 바로 적용
- transition 구조를 고려하지 않은 단순 slideshow만 구현

---

# 14. 최종적으로 원하는 구현 방향 요약

`/vhs`는 단순 이미지 슬라이드 페이지가 아니라, “기억 테이프를 재생한다”는 감상 경험을 제공해야 한다.

사용자는 library에서 앨범을 고르고, VHS 테이프 화면에서 제목과 lifestory를 본 뒤, 재생하기 버튼을 누른다. 이후 VHS 삽입 영상이 자연스럽게 재생되고, 꺼진 TV 화면을 거쳐, static noise와 함께 TV가 켜진다. 이후 TV 프레임 안에서 해당 앨범의 사진과 영상이 순차적으로 재생된다.

전체 경험은 하나의 연속된 장면처럼 보여야 하며, 개별 이미지와 비디오 에셋이 따로따로 바뀌는 느낌이 나면 안 된다.
