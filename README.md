## 인수인계 요약

- 스택: Next.js(App Router) + React, Prisma, Tailwind

## 프로젝트 구조

```
app
 ┣ api/                # 도메인별 API 라우트 (reel/record/scenes/storage 등)
 ┣ auth/               # 인증 관련 페이지/로직
 ┣ components/         # 공용 UI 컴포넌트
 ┣ contexts/           # 전역 상태/인증 컨텍스트
 ┣ edit/               # 편집 플로우
 ┣ hooks/              # 커스텀 훅
 ┣ lib/                # 공용 라이브러리/헬퍼
 ┣ login/              # 로그인 페이지
 ┣ mypage/             # 마이페이지
 ┣ utils/              # 공용 유틸
 ┣ view/               # 공개/뷰 플로우
 ┣ globals.css
 ┣ layout.js
 ┗ page.js
prisma
 ┣ migrations/         # DB 마이그레이션
 ┗ schema.prisma
public                 # 정적 자산
scripts                # 보조 스크립트
docs/jsdoc             # JSDoc 출력
```

## view/edit 구조

```
app/view
 ┗ [identifier]
   ┣ records/
   ┗ reels/
app/edit
 ┗ [username]
   ┣ records/
   ┣ reels/
   ┣ editApi.js
   ┗ dummyData.js
```

## 주요 기능 흐름

- 편집 플로우: `app/edit/` 아래에서 편집 UI 구성 후 API 호출로 저장
- 뷰 플로우: `app/view/` 아래에서 공개/프리뷰 화면 렌더링
- 인증/세션: `app/contexts/` 및 `app/api/auth/` 중심으로 처리
- 파일 업로드: `app/api/storage/` presign 후 클라이언트에서 PUT 업로드

## 주요 API 라우트(도메인별)

- Reels: `app/api/reel/`, `app/api/reels/`
- Records: `app/api/record/`, `app/api/records/`
- Scenes: `app/api/scenes/`
- Storage/Upload: `app/api/storage/`
- Users/Auth: `app/api/users/`, `app/api/auth/`
- GPT Story: `app/api/gpt-story/`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
