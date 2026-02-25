// app/api/gpt-story/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "../_lib/jwt";

export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  const token = (await auth.startsWith("Bearer ")) ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );

  const { prompt, albumTitle } = await req.json();

  if (!prompt || !prompt.trim()) {
    return NextResponse.json(
      { ok: false, error: "내용을 입력해주세요" },
      { status: 400 },
    );
  }

  const systemPrompt = `
당신은 앨범 뒷면에 들어갈 짧은 글을 작성하는 작가입니다.
사용자가 입력한 키워드나 문장을 바탕으로, 앨범에 기록할 감성적인 글을 작성합니다.

${albumTitle ? `앨범 제목: ${albumTitle}` : ""}

사용자 입력: ${prompt}

- 과업
3~5문장, 공백 포함 300자 이내로 작성합니다.
감성적이되 과장하지 마세요. 입력된 키워드와 내용을 자연스럽게 엮어 하나의 짧은 글로 만드세요.
입력에 없는 구체적 사실은 창작하지 마세요.
문장은 반드시 "~했다", "~이다", "~였다", "~있었다" 형태의 평서형 종결어미로 끝내세요.
예시: "바다를 바라보며 오래 앉아 있었다.", "그 시간이 좋았다.", "모두 함께여서 따뜻했다."
절대 "~했어", "~이야", "~줬어", "~거야" 같은 반말 종결어미를 사용하지 마세요.
담담하고 따뜻한 어조로, 마치 일기의 한 구절처럼 조용히 기록하는 문체로 작성하세요.
클리셰, 느낌표, 해시태그, 인용부호, 말줄임표를 사용하지 마세요.

- 최종 출력 형식
본문 텍스트만 반환(제목, 머리말/꼬리말, 안내문, 따옴표 금지).
300자 이내인지 점검 후 필요 시 간결하게 재압축.
`.trim();

  const openAiMessages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: openAiMessages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[GPT-STORY ERROR]", errorText);
    return NextResponse.json({ error: errorText }, { status: 500 });
  }

  const data = await response.json();
  const story = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ story });
}
