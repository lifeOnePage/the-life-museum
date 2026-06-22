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

const LANG = {
  ko: {
    chooseLanguage: "언어를 선택해주세요",
    enterEmail: "이메일을 입력해주세요",
    emailPlaceholder: "name@example.com",
    sendCode: "인증번호 받기",
    sending: "전송 중...",
    enterOtp: "인증번호를 입력해주세요",
    otpPlaceholder: "6자리",
    verifying: "확인 중...",
    next: "다음",
    newUser: "처음이시군요! 이름을 알려주세요.",
    namePlaceholder: "홍길동",
    saving: "저장 중...",
    complete: "완료",
    back: "이전으로",
    errorPhone: "전화번호를 입력해주세요",
    errorEmail: "이메일을 입력해주세요",
    errorOtp: "인증번호를 입력해주세요",
    errorName: "이름을 입력해주세요",
    errorSendCode: "인증번호 전송에 실패했어요.",
    errorVerify: "인증에 실패했어요.",
    errorSignup: "회원가입에 실패했어요.",
  },
  en: {
    chooseLanguage: "Choose your language",
    enterEmail: "Enter your email",
    emailPlaceholder: "name@example.com",
    sendCode: "Send verification code",
    sending: "Sending...",
    enterOtp: "Enter verification code",
    otpPlaceholder: "6 digits",
    verifying: "Verifying...",
    next: "Next",
    newUser: "Welcome! Please tell us your name.",
    namePlaceholder: "John Doe",
    saving: "Saving...",
    complete: "Done",
    back: "Back",
    errorPhone: "Please enter your phone number",
    errorEmail: "Please enter your email",
    errorOtp: "Please enter the verification code",
    errorName: "Please enter your name",
    errorSendCode: "Failed to send verification code.",
    errorVerify: "Verification failed.",
    errorSignup: "Sign up failed.",
  },
};

function setLocaleCookie(locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem("NEXT_LOCALE", locale);
}

export default function LoginPage() {
  const router = useRouter();
  const { token, signinWithToken } = useAuth();

  // "contact" | "otp" | "language" | "signup"
  const [stage, setStage] = useState("contact");
  const [selectedLocale, setSelectedLocale] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem("NEXT_LOCALE") || "ko" : "ko"),
  );

  const t = LANG[selectedLocale] || LANG.ko;

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
    if (stage === "language") return setStage("otp");
    if (stage === "signup") return setStage("language");
  };

  const handleSelectLanguage = (locale) => {
    setSelectedLocale(locale);
    setLocaleCookie(locale);
    setStage("signup");
  };

  // 1) Send OTP
  const onSendCode = async () => {
    setError("");
    try {
      setLoading(true);
      if (contactTab === "phone") {
        const normalized = phone.replace(/\D/g, "");
        if (!normalized) return setError(LANG[selectedLocale]?.errorPhone || "전화번호를 입력해주세요");
        await sendPhoneCode(normalized, countryCode);
      } else {
        if (!email.trim()) return setError(LANG[selectedLocale]?.errorEmail || "이메일을 입력해주세요");
        await sendEmailCode(email.trim());
      }
      setStage("otp");
    } catch (e) {
      setError(e.message || (LANG[selectedLocale]?.errorSendCode || "인증번호 전송에 실패했어요."));
    } finally {
      setLoading(false);
    }
  };

  // 2) Verify OTP → get tokens
  const onVerifyOtp = async () => {
    setError("");
    if (!otp.trim()) return setError(LANG[selectedLocale]?.errorOtp || "인증번호를 입력해주세요");
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
        setStage("language");
      } else {
        await signinWithToken(result.accessToken, result.user, result.refreshToken);
        router.push("/library");
      }
    } catch (e) {
      setError(e.message || (LANG[selectedLocale]?.errorVerify || "인증에 실패했어요."));
    } finally {
      setLoading(false);
    }
  };

  // 3) Complete signup
  const onCompleteSignup = async () => {
    setError("");
    if (!name.trim()) return setError(LANG[selectedLocale]?.errorName || "이름을 입력해주세요");
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
    height: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #37393b 0%, #1e1f21 50%, #000 100%)",
    color: "#fff",
    overflow: "hidden",
    paddingBottom: "env(safe-area-inset-bottom)",
  };
  const sheetStyle = {
    width: "100vw",
    maxWidth: 375,
    height: "100%",
    position: "relative",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    paddingTop: "max(env(safe-area-inset-top), 12px)",
    fontFamily:
      "pretendard, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica, Arial, sans-serif",
  };

  return (
    <div style={containerStyle}>
      <div style={sheetStyle}>
        {canGoBack && (
          <button
            aria-label={t.back}
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
            {t.back}
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
                    <Header>{t.enterEmail}</Header>
                    <FieldBlock
                      value={email}
                      onChange={setEmail}
                      placeholder={t.emailPlaceholder}
                      type="email"
                      autoFocus
                      onEnter={onSendCode}
                    />
                  </>
                )}

                <PrimaryButton disabled={loading} onClick={onSendCode}>
                  {loading ? t.sending : t.sendCode}
                </PrimaryButton>
              </SlideScreen>
            )}

            {stage === "otp" && (
              <SlideScreen key="stage-otp">
                <Header>{t.enterOtp}</Header>
                <FieldBlock
                  value={otp}
                  onChange={setOtp}
                  placeholder={t.otpPlaceholder}
                  type="text"
                  autoFocus
                  onEnter={onVerifyOtp}
                />
                <PrimaryButton disabled={loading} onClick={onVerifyOtp}>
                  {loading ? t.verifying : t.next}
                </PrimaryButton>
              </SlideScreen>
            )}

            {stage === "language" && (
              <SlideScreen key="stage-language">
                <Header>{t.chooseLanguage}</Header>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                  <button
                    onClick={() => handleSelectLanguage("ko")}
                    style={{
                      width: "100%",
                      height: 56,
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 12,
                      background: selectedLocale === "ko" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.18s",
                    }}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => handleSelectLanguage("en")}
                    style={{
                      width: "100%",
                      height: 56,
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 12,
                      background: selectedLocale === "en" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.18s",
                    }}
                  >
                    English
                  </button>
                </div>
              </SlideScreen>
            )}

            {stage === "signup" && (
              <SlideScreen key="stage-signup">
                <Header>{t.newUser}</Header>
                <FieldBlock
                  value={name}
                  onChange={setName}
                  placeholder={t.namePlaceholder}
                  type="text"
                  autoFocus
                  onEnter={onCompleteSignup}
                />
                <PrimaryButton disabled={loading} onClick={onCompleteSignup}>
                  {loading ? t.saving : t.complete}
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
