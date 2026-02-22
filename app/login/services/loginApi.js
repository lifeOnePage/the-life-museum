"use client";

import { toE164 } from "../../lib/phone";

const API = "https://the-life-museum-backend-production.up.railway.app/api/v1";

export async function sendPhoneCode(phone, countryCode = "+82") {
  const e164 = toE164(phone, countryCode);
  const res = await fetch(`${API}/auth/phone/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: e164 }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "인증번호 전송 실패");
  return json;
}

export async function verifyPhoneCode(phone, countryCode = "+82", code) {
  const e164 = toE164(phone, countryCode);
  const res = await fetch(`${API}/auth/phone/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: e164, code }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "인증 실패");
  // json.data: { accessToken, refreshToken, isNewUser, user }
  return json.data;
}

export async function sendEmailCode(email) {
  const res = await fetch(`${API}/auth/email/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "인증번호 전송 실패");
  return json;
}

export async function verifyEmailCode(email, code) {
  const res = await fetch(`${API}/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "인증 실패");
  // json.data: { accessToken, refreshToken, isNewUser, user }
  return json.data;
}

export async function completeSignup(token, name) {
  const res = await fetch(`${API}/auth/complete-signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "회원가입 완료 실패");
  return json.data;
}
