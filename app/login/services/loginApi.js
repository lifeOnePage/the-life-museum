// app/login/services/loginApi.js
"use client";

import { toE164 } from "../../lib/phone";
import {
  sendVerificationCode,
  confirmCode,
  setupRecaptcha as setupRecaptchaRaw,
} from "../../auth/phoneAuth";
import { auth } from "../../firebase/firebaseConfig";

// YYYY-MM-DD|YYYY.MM.DD|YYYY/MM/DD -> "YYYY.MM.DD"
export function normalizeToYMD(input) {
  if (!input) return null;
  const digits = String(input)
    .trim()
    .replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  const valid =
    dt.getFullYear() === Number(y) &&
    dt.getMonth() + 1 === Number(m) &&
    dt.getDate() === Number(d);
  if (!valid) return null;
  return `${y}${m}${d}`;
}

export function setupRecaptcha(elementId) {
  return setupRecaptchaRaw(elementId);
}

export async function sendOtp(phone) {
  const e164 = toE164(phone);
  const res = await sendVerificationCode(e164);
  return { res, verificationId: res.verificationId };
}

// Firebase 확인 → ID 토큰 발급 → 우리 서버에 교환(JWT 발급 & 사용자 upsert/조회)
export async function verifyOtp(confirmation, code) {
  await confirmCode(confirmation, code); // Firebase sign-in
  const u = auth.currentUser;
  if (!u) throw new Error("로그인 실패");

  const idToken = await u.getIdToken();

  console.group("verifyOtp: before fetch /api/auth/exchange");
  console.log("idToken: ", idToken);
  console.groupEnd();

  const res = await fetch("/api/auth/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error("토큰 교환 실패");

  const pgUser = json.user; // Postgres에 있는 사용자(없으면 최소한 mobile만 채워질 수 있음)
  const isNewUser = !(pgUser?.name && pgUser?.birthDate); // 프로필 미완료면 회원가입 단계로

  return {
    uid: u.uid,
    name: pgUser?.name || "",
    jwt: json.token,
    pgUser,
    isNewUser,
  };
}

// 회원가입 저장 (JWT 보호) -> Postgres User 생성/업데이트
export async function saveSignupProfileWithJwt({ token, payload }) {
  // payload: { name, phone, birth, email }
  const mobile = toE164(payload.phone);
  const birthDate = normalizeToYMD(payload.birth);
  if (!mobile) throw new Error("휴대폰번호 형식 오류");
  if (!birthDate) throw new Error("생년월일 형식 오류");
  console.group("save signup user /api/users");
  console.log("name: ", payload.name);
  console.log("mobile: ", mobile);
  console.log("birthDate: ", birthDate);
  console.log("email: ", payload.email);
  console.groupEnd();

  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: payload.name,
      mobile,
      birthDate,
      email: payload.email || null,
    }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "save failed");
  return json; // { ok: true, user }
}

// (기존유저) 생일 확인 (JWT 보호)
export async function verifyBirthdateWithJwt({ token, birth }) {
  const birthDate = normalizeToYMD(birth);
  if (!birthDate) throw new Error("생년월일 형식 오류");

  const res = await fetch("/api/auth/verify-birth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ birthDate }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error("verify failed");
  return json; // { ok: true, user }
}
