// app/login/page.js
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

import Header from "./components/Header";
import FieldBlock from "./components/FieldBlock";
import { PrimaryButton, SecondaryButton } from "./components/Buttons";
import SlideScreen from "./components/SlideScreen";
import ErrorToast from "./components/ErrorToast";

import {
  setupRecaptcha,
  sendOtp,
  verifyOtp,
  saveSignupProfileWithJwt,
  verifyBirthdateWithJwt,
  normalizeToYMD,
} from "./services/loginApi";

export default function LoginPage() {
  const router = useRouter();
  const { token, user, signinWithToken } = useAuth();

  const [stage, setStage] = useState("phone"); // phone → otp → signup | login
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [confirmation, setConfirmation] = useState(null);
  const [verificationId, setVerificationId] = useState(null);

  const [isNewUser, setIsNewUser] = useState(null);
  const [knownName, setKnownName] = useState("");

  // 회원가입 입력(스키마 기반: name, birth, email(선택))
  const signupFields = useMemo(
    () => [
      {
        key: "name",
        label: "이름을 입력해주세요.",
        placeholder: "홍길동",
        required: true,
        type: "text",
      },
      {
        key: "birth",
        label: "생년월일을 입력해주세요.",
        placeholder: "YYYYMMDD",
        required: true,
        type: "text",
      },
      {
        key: "email",
        label: "이메일을 입력해주세요 (선택)",
        placeholder: "name@example.com",
        required: false,
        type: "email",
        optional: true,
        skippable: true,
      },
    ],
    []
  );
  const [signupIndex, setSignupIndex] = useState(0);
  const [signupData, setSignupData] = useState({
    name: "",
    birth: "",
    email: "",
  });
  const currentSignupField = signupFields[signupIndex];

  const containerRef = useRef(null);
  const fieldRefs = useRef({});
  const [loginBirth, setLoginBirth] = useState("");

  useEffect(() => {
    setupRecaptcha("recaptcha-container");
  }, []);

  useEffect(() => {
    const f = signupFields?.[signupIndex];
    const el = fieldRefs.current[f?.key];
    if (el?.focus) el.focus();
    (containerRef.current || window).scrollTo?.({ top: 0, behavior: "smooth" });
  }, [signupIndex, signupFields]);

  const canGoBack = useMemo(() => stage !== "phone", [stage]);

  const handleBack = () => {
    setError("");
    if (stage === "otp") return setStage("phone");
    if (stage === "signup") {
      if (signupIndex > 0) setSignupIndex((i) => i - 1);
      else setStage("otp");
      return;
    }
    if (stage === "login") return setStage("otp");
  };

  // 1) OTP 보내기
  const onSendOtp = async () => {
    setError("");
    const normalized = phone.replace(/\D/g, "");
    if (!normalized) return setError("전화번호를 입력해주세요");
    try {
      setLoading(true);
      const { res, verificationId } = await sendOtp(normalized);
      setConfirmation(res);
      setVerificationId(verificationId);
      setStage("otp");
    } catch (e) {
      console.error(e);
      setError("인증번호 전송에 실패했어요. 새로고침 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 2) OTP 검증 → JWT 교환 → 신규/기존 분기
  const onVerifyOtp = async () => {
    setError("");
    if (!verificationId || !otp) return setError("인증번호를 입력해주세요");
    try {
      setLoading(true);
      console.group();
      console.log("onVerifyOtp");
      console.log("confirmation: ", confirmation);
      console.log("otp: ", otp);
      console.groupEnd();
      const result = await verifyOtp(confirmation, otp);
      // JWT + 사용자 컨텍스트 저장
      await signinWithToken(result.jwt, result.pgUser);

      setKnownName(result.pgUser?.name || "");
      setIsNewUser(result.isNewUser);
      setStage(result.isNewUser ? "signup" : "login");
      if (result.isNewUser) setSignupIndex(0);
    } catch (e) {
      console.error(e);
      setError("인증에 실패했어요. 인증번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 3a) 회원가입 단계 제출(필드별) → 마지막에 저장
  const onSubmitSignupField = async () => {
    setError("");
    const key = currentSignupField.key;
    const val = signupData[key]?.trim?.() ?? "";
    if (currentSignupField.required && !val)
      return setError("값을 입력해주세요");

    if (signupIndex < signupFields.length - 1) {
      setSignupIndex((i) => i + 1);
    } else {
      try {
        setLoading(true);
        const saved = await saveSignupProfileWithJwt({
          token,
          payload: {
            phone,
            name: signupData.name.trim(),
            birth: signupData.birth.trim(),
            email: (signupData.email || "").trim() || null,
          },
        });
        // 서버가 최신 user 반환
        await signinWithToken(token, saved.user);
        router.push("/mypage");
      } catch (e) {
        console.error(e);
        setError(
          "회원가입 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const onSkipEmail = async () => {
    setSignupData((d) => ({ ...d, email: "" }));
    if (signupIndex < signupFields.length - 1) setSignupIndex((i) => i + 1);
  };

  // 3b) 기존 유저 본인확인(생년월일)
  const onSubmitLogin = async () => {
    setError("");
    const birth = loginBirth.trim();
    if (!birth) return setError("생년월일을 입력해주세요");
    try {
      setLoading(true);
      const res = await verifyBirthdateWithJwt({ token, birth });
      await signinWithToken(token, res.user); // 혹시 서버에서 보정된 user 반환 시 반영
      router.push("/mypage");
    } catch (e) {
      console.error(e);
      setError("본인 확인에 실패했어요. 생년월일을 확인해주세요.");
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
              marginTop:60,
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

        <div
          style={{ padding: "4px 24px" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {stage === "phone" && (
              <SlideScreen key="stage-phone">
                <Header>전화번호를 입력해주세요</Header>
                <div id="recaptcha-container"></div>
                <FieldBlock
                  label="전화번호"
                  value={phone}
                  onChange={setPhone}
                  placeholder="01012345678"
                  type="tel"
                  autoFocus
                />
                <PrimaryButton disabled={loading} onClick={onSendOtp}>
                  {loading ? "전송 중..." : "인증번호 받기"}
                </PrimaryButton>
              </SlideScreen>
            )}

            {stage === "otp" && (
              <SlideScreen key="stage-otp">
                <Header>인증번호를 입력해주세요</Header>
                <FieldBlock
                  label="인증번호"
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
              <SlideScreen key="stage-signup" ref={containerRef}>
                <Header>처음이시군요! 회원가입을 진행할게요.</Header>
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "#fafafa",
                    fontWeight: 600,
                    marginTop: 8,
                  }}
                >
                  {currentSignupField.label}
                </p>

                <div style={{ marginTop: 16 }}>
                  {(() => {
                    const shownIdxs = Array.from(
                      { length: signupIndex + 1 },
                      (_, i) => i
                    );
                    const orderedIdxs = [
                      signupIndex,
                      ...shownIdxs.slice(0, signupIndex),
                    ];
                    return orderedIdxs.map((origIdx) => {
                      const f = signupFields[origIdx];
                      const isCurrent = origIdx === signupIndex;
                      return (
                        <SlideScreen.Row key={f.key}>
                          <FieldBlock
                            label={f.label}
                            subLabel={f.subLabel}
                            value={signupData[f.key]}
                            onChange={(v) =>
                              setSignupData((d) => ({ ...d, [f.key]: v }))
                            }
                            placeholder={f.placeholder}
                            type={f.type}
                            autoFocus={isCurrent}
                            inputRef={(el) => (fieldRefs.current[f.key] = el)}
                          />
                        </SlideScreen.Row>
                      );
                    });
                  })()}
                </div>

                <div style={{ marginTop: 8 }}>
                  {currentSignupField?.skippable && (
                    <SecondaryButton
                      onClick={async () => {
                        onSkipEmail();
                        await onSubmitSignupField();
                      }}
                      disabled={loading}
                    >
                      이메일이 없어요 / 입력하지 않고 넘어가기
                    </SecondaryButton>
                  )}
                  <PrimaryButton
                    onClick={onSubmitSignupField}
                    disabled={loading}
                  >
                    {signupIndex < signupFields.length - 1
                      ? "다음"
                      : loading
                      ? "저장 중..."
                      : "완료"}
                  </PrimaryButton>
                </div>
              </SlideScreen>
            )}

            {stage === "login" && (
              <SlideScreen key="stage-login">
                <Header>
                  {knownName ? <>반가워요, {knownName}님</> : <>반가워요!</>}
                </Header>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "#aaa",
                    margin: "8px 0px",
                  }}
                >
                  생년월일을 입력해주세요
                </p>
                <FieldBlock
                  label="생년월일"
                  value={loginBirth}
                  onChange={setLoginBirth}
                  placeholder="YYYYMMDD"
                  type="text"
                  autoFocus
                />
                <PrimaryButton onClick={onSubmitLogin} disabled={loading}>
                  {loading ? "확인 중..." : "확인"}
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
