"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/contexts/AuthContext";

import Header from "@/app/login/components/Header";
import FieldBlock from "@/app/login/components/FieldBlock";
import { PrimaryButton } from "@/app/login/components/Buttons";
import SlideScreen from "@/app/login/components/SlideScreen";
import ErrorToast from "@/app/login/components/ErrorToast";

import {
  sendEmailCode,
  verifyEmailCode,
  completeSignup,
} from "@/app/login/services/loginApi";

const T = {
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

export default function LocaleLoginPage() {
  const router = useRouter();
  const { locale: routeLocale } = useParams();
  const { signinWithToken } = useAuth();

  // "contact" | "otp" | "language" | "signup"
  const [stage, setStage] = useState("contact");
  const [selectedLocale, setSelectedLocale] = useState(routeLocale || "ko");

  const t = T[selectedLocale] || T.ko;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const onSendCode = async () => {
    setError("");
    if (!email.trim()) return setError(t.errorEmail);
    try {
      setLoading(true);
      await sendEmailCode(email.trim());
      setStage("otp");
    } catch (e) {
      setError(e.message || t.errorSendCode);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    setError("");
    if (!otp.trim()) return setError(t.errorOtp);
    try {
      setLoading(true);
      const result = await verifyEmailCode(email.trim(), otp.trim());
      if (result.isNewUser) {
        setAuthToken(result.accessToken);
        setAuthUser(result.user);
        setAuthRefreshToken(result.refreshToken);
        setStage("language");
      } else {
        await signinWithToken(
          result.accessToken,
          result.user,
          result.refreshToken,
        );
        router.push(`/${selectedLocale}/library`);
      }
    } catch (e) {
      setError(e.message || t.errorVerify);
    } finally {
      setLoading(false);
    }
  };

  const onCompleteSignup = async () => {
    setError("");
    if (!name.trim()) return setError(t.errorName);
    try {
      setLoading(true);
      const updatedUser = await completeSignup(authToken, name.trim());
      await signinWithToken(authToken, updatedUser, authRefreshToken);
      router.push(`/${selectedLocale}/library`);
    } catch (e) {
      setError(e.message || t.errorSignup);
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
                <Header>{t.enterEmail}</Header>
                <FieldBlock
                  value={email}
                  onChange={setEmail}
                  placeholder={t.emailPlaceholder}
                  type="email"
                  autoFocus
                  onEnter={onSendCode}
                />
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <button
                    onClick={() => handleSelectLanguage("ko")}
                    style={{
                      width: "100%",
                      height: 56,
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 12,
                      background:
                        selectedLocale === "ko"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.07)",
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
                      background:
                        selectedLocale === "en"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.07)",
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
