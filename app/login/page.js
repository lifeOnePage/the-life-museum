// app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

import Header from "./components/Header";
import FieldBlock from "./components/FieldBlock";
import { PrimaryButton } from "./components/Buttons";
import SlideScreen from "./components/SlideScreen";
import ErrorToast from "./components/ErrorToast";
import CountryCodeSelect from "./components/CountryCodeSelect";

import {
  sendPhoneCode,
  verifyPhoneCode,
  sendEmailCode,
  verifyEmailCode,
  completeSignup,
} from "./services/loginApi";

export default function LoginPage() {
  const router = useRouter();
  const { token, signinWithToken } = useAuth();

  // "contact" | "otp" | "signup"
  const [stage, setStage] = useState("contact");
  // "phone" | "email"
  const [contactTab, setContactTab] = useState("email");

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+82");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stored after OTP verify, used for complete-signup
  const [authToken, setAuthToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authRefreshToken, setAuthRefreshToken] = useState(null);

  const canGoBack = stage !== "contact";

  const handleBack = () => {
    setError("");
    if (stage === "otp") return setStage("contact");
    if (stage === "signup") return setStage("otp");
  };

  // 1) Send OTP
  const onSendCode = async () => {
    setError("");
    try {
      setLoading(true);
      if (contactTab === "phone") {
        const normalized = phone.replace(/\D/g, "");
        if (!normalized) return setError("전화번호를 입력해주세요");
        await sendPhoneCode(normalized, countryCode);
      } else {
        if (!email.trim()) return setError("이메일을 입력해주세요");
        await sendEmailCode(email.trim());
      }
      setStage("otp");
    } catch (e) {
      setError(e.message || "인증번호 전송에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 2) Verify OTP → get tokens
  const onVerifyOtp = async () => {
    setError("");
    if (!otp.trim()) return setError("인증번호를 입력해주세요");
    try {
      setLoading(true);
      let result;
      if (contactTab === "phone") {
        const normalized = phone.replace(/\D/g, "");
        result = await verifyPhoneCode(normalized, countryCode, otp.trim());
      } else {
        result = await verifyEmailCode(email.trim(), otp.trim());
      }
      // result: { accessToken, refreshToken, isNewUser, user }
      if (result.isNewUser) {
        setAuthToken(result.accessToken);
        setAuthUser(result.user);
        setAuthRefreshToken(result.refreshToken);
        setStage("signup");
      } else {
        await signinWithToken(result.accessToken, result.user, result.refreshToken);
        router.push("/library");
      }
    } catch (e) {
      setError(e.message || "인증에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 3) Complete signup
  const onCompleteSignup = async () => {
    setError("");
    if (!name.trim()) return setError("이름을 입력해주세요");
    try {
      setLoading(true);
      const updatedUser = await completeSignup(authToken, name.trim());
      await signinWithToken(authToken, updatedUser, authRefreshToken);
      router.push("/library");
    } catch (e) {
      setError(e.message || "회원가입에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #37393b 0%, #1e1f21 50%, #000 100%)",
    color: "#fff",
    overflow: "hidden",
  };
  const sheetStyle = {
    width: "100vw",
    maxWidth: 375,
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "pretendard, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica, Arial, sans-serif",
  };

  return (
    <div style={containerStyle}>
      <div style={sheetStyle}>
        {canGoBack && (
          <button
            aria-label="뒤로가기"
            onClick={handleBack}
            style={{
              zIndex: 100,
              width: "100%",
              height: 36,
              marginTop: 60,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              color: "#ababab",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            이전으로
          </button>
        )}

        <div style={{ padding: "4px 24px" }}>
          <AnimatePresence mode="wait" initial={false}>
            {stage === "contact" && (
              <SlideScreen key="stage-contact">
                {/* Tab toggle — 전화번호 비활성화, 이메일만 사용 */}
                {/* <div
                  style={{
                    display: "flex",
                    gap: 8,
                    margin: "20px 0 16px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: 4,
                  }}
                >
                  {["phone", "email"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setContactTab(tab);
                        setError("");
                      }}
                      style={{
                        flex: 1,
                        height: 36,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        background:
                          contactTab === tab
                            ? "rgba(255,255,255,0.18)"
                            : "transparent",
                        color: contactTab === tab ? "#fff" : "#aaa",
                        transition: "all 0.18s",
                      }}
                    >
                      {tab === "phone" ? "전화번호" : "이메일"}
                    </button>
                  ))}
                </div> */}

                {/* 전화번호 입력 — 비활성화 */}
                {/* {contactTab === "phone" && (
                  <>
                    <Header>전화번호를 입력해주세요</Header>
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 500,
                          marginBottom: 8,
                          color: "#fff",
                        }}
                      >
                        전화번호
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <CountryCodeSelect
                          value={countryCode}
                          onChange={setCountryCode}
                        />
                        <div style={{ flex: 1 }}>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={
                              countryCode === "+82"
                                ? "01012345678"
                                : "Phone number"
                            }
                            autoFocus
                            style={{
                              width: "100%",
                              height: 48,
                              padding: "0 16px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: 8,
                              color: "#fff",
                              fontSize: 15,
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )} */}

                {contactTab === "email" && (
                  <>
                    <Header>이메일을 입력해주세요</Header>
                    <FieldBlock
                      value={email}
                      onChange={setEmail}
                      placeholder="name@example.com"
                      type="email"
                      autoFocus
                    />
                  </>
                )}

                <PrimaryButton disabled={loading} onClick={onSendCode}>
                  {loading ? "전송 중..." : "인증번호 받기"}
                </PrimaryButton>
              </SlideScreen>
            )}

            {stage === "otp" && (
              <SlideScreen key="stage-otp">
                <Header>인증번호를 입력해주세요</Header>
                <FieldBlock
                  value={otp}
                  onChange={setOtp}
                  placeholder="6자리"
                  type="text"
                  autoFocus
                />
                <PrimaryButton disabled={loading} onClick={onVerifyOtp}>
                  {loading ? "확인 중..." : "다음"}
                </PrimaryButton>
              </SlideScreen>
            )}

            {stage === "signup" && (
              <SlideScreen key="stage-signup">
                <Header>처음이시군요! 이름을 알려주세요.</Header>
                <FieldBlock
                  value={name}
                  onChange={setName}
                  placeholder="홍길동"
                  type="text"
                  autoFocus
                />
                <PrimaryButton disabled={loading} onClick={onCompleteSignup}>
                  {loading ? "저장 중..." : "완료"}
                </PrimaryButton>
              </SlideScreen>
            )}
          </AnimatePresence>
        </div>

        <ErrorToast message={error} onClear={() => setError("")} />
      </div>
    </div>
  );
}
