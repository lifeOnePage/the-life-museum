// app/api/auth/exchange/route.js
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/app/api/_lib/firebaseAdmin";
import client from "@/app/client";
import { signJwt } from "@/app/lib/jwt";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken)
      return NextResponse.json(
        { ok: false, error: "Missing idToken" },
        { status: 400 }
      );

    // console.group("api/auth/exchange");
    // console.log("firebaseAdmin: ", await firebaseAdmin.auth());
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, phone_number: phoneNumber } = decoded;

    // console.log("phoneNumber: ", phoneNumber);
    // console.log("idToken: ", idToken);
    // console.groupEnd();

    const user = await client.user.upsert({
      where: { mobile: phoneNumber || "" }, // mobile이 유니크이므로 우선 mobile로 upsert
      update: {
        /* 로그인 시점에 변경할 필드가 있으면 추가 */
      },
      create: {
        name: "", // 가입 이전에는 비워둠
        mobile: phoneNumber || "", // E.164
        birthDate: "", // 가입 이전에는 비워둠
        email: null,
      },
    });

    const token = signJwt({ sub: user.id, mobile: user.mobile });

    return NextResponse.json({ ok: true, token, user });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "exchange_failed" },
      { status: 401 }
    );
  }
}
