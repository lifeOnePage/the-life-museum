// app/api/reel/lifestory/[id]/route.js
import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/jwt";

/** GET /api/reel/lifestory/:id
 *  - edit 모드면 전체 반환, 아니면 story만
 */
export async function GET(req, { params }) {
  const { id } = await params; // Reel.id
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const editParam = url.searchParams.get("edit");
  const editHeader = req.headers.get("x-edit-mode");
  let isEdit = editParam === "1" || editParam === "true" || editHeader === "true";

  const reel = await client.reel.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      lifestory: {
        select: {
          mood: true,        // style
          qaCount: true,
          qaList: true,      // { questions:[], answers:[] }
          result: true,      // story
          tokenUsage: true,  // 사용량
          updatedAt: true,
        },
      },
    },
  });

  if (!reel) return NextResponse.json({ ok: true, item: null });

  const ls = reel.lifestory;
  const data = {
    style: ls?.mood ?? null,
    qaCount: ls?.qaCount ?? 0,
    questions: ls?.qaList?.questions ?? [],
    answers: ls?.qaList?.answers ?? [],
    story: ls?.result ?? "",
    tokenUsage: ls?.tokenUsage ?? 0, //
    updatedAt: ls?.updatedAt ?? null,
    name: reel.name,
  };

  if (!isEdit) {
    return NextResponse.json({ ok: true, item: { story: data.story, name: reel.name } });
  }
  return NextResponse.json({ ok: true, item: data });
}

/** PATCH /api/reel/lifestory/:id
 * body: {
 *   // 사용량 처리
 *   incUsage?: boolean,                // true면 tokenUsage += 1
 *   // 선택적 필드 업데이트 (부분 업데이트 허용)
 *   style?: string | null,
 *   questions?: string[],
 *   answers?: string[],
 *   story?: string
 * }
 */
export async function PATCH(req, { params }) {
  const { id } = await params; // Reel.id
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    incUsage = false,
    style,
    questions,
    answers,
    story,
  } = body;

  const reel = await client.reel.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });
  if (!reel) {
    return NextResponse.json({ ok: false, error: "reel not found" }, { status: 404 });
  }

  // 동적 업데이트 객체 구성
  const updateData = {};
  const createData = { reelId: reel.id };

  if (incUsage) {
    updateData.tokenUsage = { increment: 1 };     // 사용량 증가
    createData.tokenUsage = 1;
  }

  if (style !== undefined) {
    updateData.mood = style;
    createData.mood = style ?? null;
  }

  if (questions !== undefined && answers !== undefined) {
    const qaCount = Array.isArray(questions) ? questions.length : 0;
    updateData.qaCount = qaCount;
    updateData.qaList = { questions, answers };
    createData.qaCount = qaCount;
    createData.qaList = { questions, answers };
  }

  if (story !== undefined) {
    updateData.result = story ?? "";
    createData.result = story ?? "";
  }

  // 아무 변경이 없으면 그대로 현재 상태 반환
  if (Object.keys(updateData).length === 0) {
    const exists = await client.lifestory.findUnique({
      where: { reelId: reel.id },
      select: { mood: true, qaCount: true, qaList: true, result: true, tokenUsage: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, item: exists ?? null });
  }

  const saved = await client.lifestory.upsert({
    where: { reelId: reel.id },
    update: updateData,
    create: createData,
    select: { mood: true, qaCount: true, qaList: true, result: true, tokenUsage: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, item: saved });
}
