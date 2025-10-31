// app/api/reel/lifestory/[id]/route.js
import { NextResponse } from "next/server";
import client from "@/app/client";
import { verifyJwt } from "@/app/lib/jwt";

/* GET /api/reel/lifestory/:id
 * - edit 모드면 전체 반환, 아니면 story만
 * - edit 모드는 ?edit=1 또는 헤더 x-edit-mode: true (GET body는 환경에 따라 무시될 수 있어, 쿼리/헤더를 권장)
 */
export async function GET(req, { params }) {
  const { id } = await params; // Reels.identifier
  const auth = req.headers.get("authorization") || "";
  const token = (await auth.startsWith("Bearer ")) ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload)
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  const url = new URL(req.url);
  const editParam = url.searchParams.get("edit");
  const editHeader = req.headers.get("x-edit-mode");
  let isEdit =
    editParam === "1" || editParam === "true" || editHeader === "true";

  // (호환) GET body가 있으면 시도
  try {
    const body = await req.json();
    if (body && (body.edit === true || body.mode === "edit")) isEdit = true;
  } catch (_) {}

  const reel = await client.reel.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      lifestory: {
        select: {
          mood: true, // style
          qaCount: true,
          qaList: true, // { questions:[], answers:[] }
          result: true, // story
          updatedAt: true,
        },
      },
    },
  });

  if (!reel) {
    return NextResponse.json({ ok: true, item: null });
  }

  const ls = reel.lifestory;
  const data = {
    style: ls?.mood ?? null,
    qaCount: ls?.qaCount ?? 0,
    questions: ls?.qaList?.questions ?? [],
    answers: ls?.qaList?.answers ?? [],
    story: ls?.result ?? "",
    updatedAt: ls?.updatedAt ?? null,
    name: reel.name,
  };

  if (!isEdit) {
    return NextResponse.json({
      ok: true,
      item: { story: data.story, name: reel.name },
    });
  }
  return NextResponse.json({ ok: true, item: data });
}

/* PATCH /api/reel/lifestory/:id
 * body: { style, questions, answers, story }
 * - Lifestory upsert (reelId 기준)
 */
export async function PATCH(req, { params }) {
  const { id } = await params; // Reels.identifier
  const {
    style = null,
    questions = [],
    answers = [],
    story = "",
  } = await req.json().catch(() => ({}));

  const reel = await client.reel.findUnique({
    where: { id : Number(id) },
    select: { id: true },
  });
  if (!reel) {
    return NextResponse.json(
      { ok: false, error: "reel not found" },
      { status: 404 },
    );
  }

  const data = {
    mood: style,
    qaCount: Array.isArray(questions) ? questions.length : 0,
    qaList: { questions, answers },
    result: story,
  };

  const saved = await client.lifestory.upsert({
    where: { reelId: reel.id },
    update: data,
    create: { reelId: reel.id, ...data },
    select: {
      mood: true,
      qaCount: true,
      qaList: true,
      result: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, item: saved });
}
