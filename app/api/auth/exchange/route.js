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
    const {
      uid,
      phone_number: phoneNumber,
      email,
      name: displayName,
    } = decoded;

    // console.log("phoneNumber: ", phoneNumber);
    // console.log("idToken: ", idToken);
    // console.groupEnd();

    let user = await client.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user && phoneNumber) {
      user = await client.user.findUnique({
        where: { mobile: phoneNumber },
      });
    }

    if (user) {
      user = await client.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: uid,
          mobile: phoneNumber || user.mobile,
          email: email ?? user.email,
        },
      });
    } else {
      user = await client.user.create({
        data: {
          firebaseUid: uid,
          name: displayName || "",
          mobile: phoneNumber || null,
          birthDate: null,
          email: email ?? null,
        },
      });
    }

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
