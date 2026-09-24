"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEMORIAL_MAX_MEDIA } from "@/app/lib/constants";

// Google Photos Picker API 플로우.
// GIS 토큰 → 피커 세션 생성 → 사용자가 구글 UI에서 선택(새 창) → 세션 폴링 →
// 선택 항목 조회 → { accessToken, items } 반환. baseUrl/토큰은 ~60분 만료이므로
// done 직후 즉시 백엔드 인제스트에 넘겨야 한다.
//
// v1은 웹 전용 — Capacitor WebView는 구글 OAuth가 차단됨(disallowed_useragent).
// TODO(native v2): 시스템 브라우저 OAuth + 딥링크 리디렉트.

const GSI_SRC = "https://accounts.google.com/gsi/client";
const PICKER_API = "https://photospicker.googleapis.com/v1";
const SCOPE = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

let gsiPromise = null;
function loadGsi() {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error("Google 스크립트를 불러오지 못했습니다"));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

/**
 * 상태머신: idle → authorizing → creating_session → awaiting_user(pickerUri)
 *          → polling → fetching_items → done | error
 *
 * 팝업 차단 회피: pickerUri가 준비되면 훅은 awaiting_user로 멈추고,
 * UI의 "Google Photos 열기" 버튼 클릭(사용자 제스처)에서 openPicker()가
 * 동기적으로 window.open을 호출한다.
 */
export function useGooglePhotosPicker() {
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { accessToken, items }
  const tokenRef = useRef(null);
  const sessionRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const fail = useCallback((code, message) => {
    setError({ code, message });
    setPhase("error");
  }, []);

  const start = useCallback(async () => {
    if (!CLIENT_ID) {
      fail("config", "NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되지 않았습니다");
      return;
    }
    setError(null);
    setResult(null);
    cancelledRef.current = false;
    try {
      setPhase("authorizing");
      await loadGsi();

      const accessToken = await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: (resp) => {
            if (resp.error) reject(new Error(resp.error));
            else resolve(resp.access_token);
          },
          error_callback: (err) =>
            reject(new Error(err?.type || "popup_closed")),
        });
        client.requestAccessToken();
      });
      if (cancelledRef.current) return;
      tokenRef.current = accessToken;

      setPhase("creating_session");
      const sessionRes = await fetch(`${PICKER_API}/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickingConfig: { maxItemCount: String(MEMORIAL_MAX_MEDIA) },
        }),
      });
      if (!sessionRes.ok) throw new Error("세션 생성에 실패했습니다");
      const session = await sessionRes.json();
      if (cancelledRef.current) return;
      sessionRef.current = session;
      setPhase("awaiting_user");
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.includes("access_denied") || msg.includes("popup_closed")) {
        fail("denied", "구글 계정 접근이 취소되었습니다");
      } else {
        fail("network", msg);
      }
    }
  }, [fail]);

  /** 사용자 제스처 핸들러 안에서 동기 호출할 것 (팝업 차단 방지). */
  const openPicker = useCallback(() => {
    const session = sessionRef.current;
    if (!session?.pickerUri) return;
    window.open(session.pickerUri, "_blank", "noopener");
    // 폴링 시작
    setPhase("polling");
    const token = tokenRef.current;
    const pollMs = parseDuration(session.pollingConfig?.pollInterval, 3000);
    const timeoutMs = parseDuration(
      session.pollingConfig?.timeoutIn,
      10 * 60 * 1000,
    );
    const startedAt = Date.now();

    const poll = async () => {
      while (!cancelledRef.current) {
        if (Date.now() - startedAt > timeoutMs) {
          fail("timeout", "선택 대기 시간이 초과되었습니다");
          return;
        }
        await new Promise((r) => setTimeout(r, pollMs));
        try {
          const res = await fetch(`${PICKER_API}/sessions/${session.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (data.mediaItemsSet) {
            await fetchItems(session.id, token);
            return;
          }
        } catch {
          // 일시 오류 — 다음 폴링에서 재시도
        }
      }
    };

    const fetchItems = async (sessionId, accessToken) => {
      setPhase("fetching_items");
      try {
        const items = [];
        let pageToken = null;
        do {
          const url = new URL(`${PICKER_API}/mediaItems`);
          url.searchParams.set("sessionId", sessionId);
          url.searchParams.set("pageSize", "100");
          if (pageToken) url.searchParams.set("pageToken", pageToken);
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!res.ok) throw new Error("선택 항목을 불러오지 못했습니다");
          const data = await res.json();
          for (const mi of data.mediaItems || []) {
            items.push({
              id: mi.id,
              type: mi.type === "VIDEO" ? "video" : "image",
              mimeType: mi.mediaFile?.mimeType || null,
              baseUrl: mi.mediaFile?.baseUrl,
              filename: mi.mediaFile?.filename || null,
            });
          }
          pageToken = data.nextPageToken || null;
        } while (pageToken);

        // maxItemCount가 무시된 경우 대비 (벨트+서스펜더)
        const capped = items
          .filter((i) => i.baseUrl)
          .slice(0, MEMORIAL_MAX_MEDIA);
        if (capped.length === 0) {
          fail("cancelled", "선택된 미디어가 없습니다");
          return;
        }
        // 세션 정리 (베스트 에포트)
        fetch(`${PICKER_API}/sessions/${sessionId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});

        setResult({ accessToken, items: capped });
        setPhase("done");
      } catch (e) {
        fail("network", String(e?.message || e));
      }
    };

    poll();
  }, [fail]);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    setPhase("idle");
    setError(null);
    setResult(null);
    sessionRef.current = null;
    // 다음 시작을 위해 취소 플래그 해제
    setTimeout(() => {
      cancelledRef.current = false;
    }, 0);
  }, []);

  return { phase, error, result, start, openPicker, reset };
}

function parseDuration(protoDuration, fallbackMs) {
  // Picker API duration: "3.5s" 형식
  if (typeof protoDuration === "string" && protoDuration.endsWith("s")) {
    const sec = parseFloat(protoDuration);
    if (!Number.isNaN(sec)) return sec * 1000;
  }
  return fallbackMs;
}
