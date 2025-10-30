// app/api/gpt-story/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "../_lib/jwt";

export async function POST(req) {
  // messages: [{ sender: 'bot' | 'user', text: string }...]
  // style: '진중한' | '낭만적인' | '재치있는' | '신비로운'
  const auth = req.headers.get("authorization") || "";
  const token = (await auth.startsWith("Bearer ")) ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  const { messages = [], style, userName } = await req.json();

  // 분위기별 톤 가이드(선택 사항: 모델이 톤을 더 잘 따라오도록 도와줍니다)
  const toneMap = {
    진중한: "차분하고 깊이 있는 어조, 과장 없이 담백하게.",
    낭만적인: "따뜻하고 서정적인 어조, 부드러운 감수성.",
    재치있는: "위트 있고 가볍게, 다만 진정성은 유지.",
    신비로운: "몽환적이고 은유적인 표현, 과장 없이 절제.",
  };
  const selectedTone = style && toneMap[style] ? toneMap[style] : null;

  const systemPrompt = `
당신은 주어진 Q&A를 바탕으로 ${userName} 님의 ‘생애문(life story essay)’을 쓰는 작가입니다.
${selectedTone} 분위기로 아래 지시문에 따라 생애문을 작성합니다.

- 입력

인물 이름: ${userName}

톤: ${selectedTone}

사실 정보(Q&A 데이터): ${messages}

예: 성장 배경, 특별한 사건/기억, 관계(가족/친구/소중한 인물), 좋아했던 일/습관/성격, 삶의 태도/철학 등

- 과업

출력은 본문만, 3~5문장, 공백 포함 300자 이내로 작성합니다.

감성적이되 과장 금지, 사실 기반으로 씁니다(없는 정보 창작 금지).

시간 순 전개(과거 → 전환점/사건 → 현재/태도)를 따르되, 중심 주제/사건/인물을 자연스럽게 부각하세요.

다음 요소들을 가능한 범위 내에서 반영하세요(자료에 없으면 생략):

성장 환경과 배경

특별한 기억 또는 사건

가족/친구/소중한 인물과의 관계

좋아했던 일·습관·성격적 특징

삶의 태도·철학(현재 혹은 앞으로의 마음가짐)

3인칭 이름 서술을 기본으로 하되 대명사 남용을 피하십시오(“그/그녀” 최소화, 이름 재지칭 1회 내).

클리셰, 과장 표현, 느낌표, 해시태그, 인용부호, 말줄임표를 사용하지 마십시오.

도치/수사 남발 금지, 구체적 명사·동사 우선, 군더더기 수식어 최소화.

문장 종결 통일(평서형), 지나친 수식/메타 코멘트 금지.

- 톤 가이드(선택된 톤에 맞춰 어휘·리듬 조절)

진중한: 담담·정제, 절제된 어휘, 잔잔한 울림

낭만적인: 따뜻·서정, 온기 있는 어휘, 은은한 이미지

재치있는: 경쾌·가볍게, 위트 있는 연결, 과장은 금지

신비로운: 몽환·은유 절제, 모호함 과용 금지(핵심 사실은 분명히)

- 누락/불확실 처리

정보가 없으면 추측하지 말고 해당 요소는 생략합니다. 문장 연결은 자연스럽게 매끈하게 정리하세요.

- 최종 출력 형식

본문 텍스트만 반환(제목, 머리말/꼬리말, 안내문, 따옴표 금지).

300자 이내인지 마지막에 스스로 점검 후 필요 시 간결하게 재압축.
`.trim();
  console.log(systemPrompt);

  // 대화 메시지를 OpenAI 포맷으로 변환
  const openAiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.sender === "bot" ? "assistant" : "user",
      content: m.text,
    })),
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
