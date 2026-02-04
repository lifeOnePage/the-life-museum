// app/api/users/create/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/api/_lib/jwt"; // JWT 검증 (경로는 프로젝트 구조에 맞게 조정)
import client from "@/app/client"; // app/ 디렉토리의 client Client (경로 맞게 조정)

export const runtime = "nodejs";

/** 아주 기본적인 이메일 패턴 (필요 시 강화) */
function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

/** 아주 간단한 E.164 체크(+821012345678 형태). 클라이언트에서 이미 toE164 했다면 엄격 검증은 생략 가능 */
function isLikelyE164(mobile) {
  return /^\+?[1-9]\d{6,14}$/.test(String(mobile || "").trim());
}

/** "YYYY.MM.DD" 포맷 여부(클라이언트에서 normalizeToYMD를 거친 값 기대) */
function isYMD(s) {
  return /^\d{4}\d{2}\d{2}$/.test(String(s || "").trim());
}

export async function POST(req) {
  try {
    console.log("----------create----------");
    console.log("req:", req);
    // 1) JWT 인증
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const payload = token ? verifyJwt(token) : null;
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // 2) 입력 파싱
    const body = await req.json().catch(() => ({}));
    console.log("body: ", body);
    const name = String(body?.name ?? "").trim();
    const mobile = String(body?.mobile ?? "").trim();
    const birthDate = String(body?.birthDate ?? "").trim();
    const email =
      body?.email == null || String(body.email).trim() === ""
        ? null
        : String(body.email).trim();

    // 3) 기본 검증 (클라이언트에서 이미 정규화했다고 가정하지만, 서버에서도 최소 검증)
    const errors = {};
    if (!name) errors.name = "name is required";
    if (!mobile || !isLikelyE164(mobile))
      errors.mobile = "mobile must be E.164-like";
    if (!birthDate || !isYMD(birthDate))
      errors.birthDate = 'birthDate must be "YYYY.MM.DD"';
    if (email && !isEmail(email)) errors.email = "email is invalid";
    console.log("errors: ", errors);
    if (Object.keys(errors).length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // 4) 업데이트 우선, 없으면 생성
    //    JWT payload.sub 는 earlier 설계에서 user.id(Int)로 서명했음을 전제
    const id = Number(payload.sub);
    let user;

    try {
      user = await client.user.update({
        where: { id },
        data: {
          // plan 은 스키마 default("free")라 여기서는 건드리지 않음
          name,
          mobile,
          birthDate,
          email,
        },
        select: {
          id: true,
          name: true,
          mobile: true,
          birthDate: true,
          email: true,
          plan: true,
        },
      });
    } catch (e) {
      // P2025: Record not found → 생성으로 폴백
      if (e?.code === "P2025") {
        user = await client.user.create({
          data: { name, mobile, birthDate, email }, // plan은 default
          select: {
            id: true,
            name: true,
            mobile: true,
            birthDate: true,
            email: true,
            plan: true,
          },
        });
      } else if (e?.code === "P2002") {
        // 고유 제약 위반 (mobile/email)
        const fields = e?.meta?.target || [];
        return NextResponse.json(
          { ok: false, error: "unique_constraint_violation", fields },
          { status: 409 }
        );
      } else {
        throw e;
      }
    }

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e) {
    // client 고유 제약 충돌
    if (e?.code === "P2002") {
      const fields = e?.meta?.target || [];
      return NextResponse.json(
        { ok: false, error: "unique_constraint_violation", fields },
        { status: 409 }
      );
    }
    console.error("[/api/users] error:", e);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { name, mobile, email } = await req.json();
  const data = {};
  if (name != null) data.name = String(name).trim();
  if (mobile != null) {
    const m = String(mobile).trim();
    if (!isLikelyE164(m)) return NextResponse.json({ ok: false, error: "invalid_mobile" }, { status: 400 });
    data.mobile = m;
  }
  if (email !== undefined) {
    if (email === null || String(email).trim() === "") data.email = null;
    else if (!isEmail(email)) return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    else data.email = String(email).trim();
  }

  try {
    const user = await client.user.update({
      where: { id: Number(payload.sub) },
      data,
      select: { id: true, name: true, mobile: true, email: true, birthDate: true, plan: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    if (e?.code === "P2002") {
      // unique (mobile/email) 충돌
      return NextResponse.json({ ok: false, error: "conflict" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}