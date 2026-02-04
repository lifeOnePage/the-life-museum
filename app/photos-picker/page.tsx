"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SCOPE =
  "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";

declare global {
  interface Window {
    google?: any;
  }
}

type PickedMediaItem = {
  id: string;
  mediaFile?: {
    baseUrl?: string;
    mimeType?: string;
    filename?: string;
  };
};

export default function PhotosPickerPage() {
  const [gisReady, setGisReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pickerUri, setPickerUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PickedMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef<Record<string, string>>({});

  // 1) Google Identity Services 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisReady(true);
    script.onerror = () => setError("Failed to load Google Identity Services.");
    document.head.appendChild(script);
  }, []);

  // 2) 토큰 요청 핸들러
  const tokenClient = useMemo(() => {
    if (!gisReady) return null;
    const google = window.google;
    if (!google?.accounts?.oauth2) return null;

    return google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: SCOPE,
      callback: (resp: any) => {
        if (resp?.access_token) setToken(resp.access_token);
        else setError("No access token returned.");
      },
    });
  }, [gisReady]);

  async function startPickerFlow() {
    try {
      setError(null);
      setLoading(true);
      setItems([]);
      setSessionId(null);
      setPickerUri(null);

      // (A) 토큰이 없으면 먼저 발급
      const accessToken = await ensureToken();
      // (B) 서버에서 세션 생성
      const sess = await createSession(accessToken);

      setSessionId(sess.sessionId);
      setPickerUri(sess.pickerUri);

      // (C) pickerUri 열기 (웹앱은 /autoclose 권장)
      window.open(
        `${sess.pickerUri}/autoclose`,
        "_blank",
        "noopener,noreferrer",
      );

      // (D) 세션 폴링 → 완료되면 mediaItems.list
      const done = await pollUntilDone(accessToken, sess.sessionId);
      if (!done) throw new Error("Picker session timed out.");

      const picked = await listPickedItems(accessToken, sess.sessionId);
      setItems(picked);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function ensureToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (token) return resolve(token);
      if (!tokenClient) return reject(new Error("Token client not ready."));

      tokenClient.callback = (resp: any) => {
        if (resp?.access_token) {
          setToken(resp.access_token);
          resolve(resp.access_token);
        } else {
          reject(new Error("Failed to get access token."));
        }
      };

      // prompt: "" 로 하면 기존 동의가 있으면 조용히 토큰 나올 때도 있음
      tokenClient.requestAccessToken({ prompt: "" });
    });
  }

  async function createSession(accessToken: string) {
    const res = await fetch("/api/photos/picker/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const detail = await readErrorBody(res);
      throw new Error(
        `Failed to create picker session (${res.status}). ${detail}`,
      );
    }
    return (await res.json()) as { sessionId: string; pickerUri: string };
  }

  async function getSession(accessToken: string, sessionId: string) {
    const res = await fetch(
      `/api/photos/picker/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!res.ok) {
      const detail = await readErrorBody(res);
      throw new Error(
        `Failed to get picker session (${res.status}). ${detail}`,
      );
    }
    return (await res.json()) as {
      sessionId: string;
      mediaItemsSet: boolean;
      // API가 추천 폴링 간격/타임아웃을 주는 경우가 있음
      // 여기선 단순화해서 고정 간격으로 구현
    };
  }

  async function pollUntilDone(accessToken: string, sessionId: string) {
    const startedAt = Date.now();
    const timeoutMs = 2 * 60 * 1000; // 2분 (원하면 늘려)
    const intervalMs = 1500;

    while (Date.now() - startedAt < timeoutMs) {
      const sess = await getSession(accessToken, sessionId);
      if (sess.mediaItemsSet) return true;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
  }

  async function listPickedItems(
    accessToken: string,
    sessionId: string,
  ): Promise<PickedMediaItem[]> {
    const res = await fetch(
      `/api/photos/picker/mediaItems?sessionId=${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!res.ok) {
      const detail = await readErrorBody(res);
      throw new Error(
        `Failed to list picked media items (${res.status}). ${detail}`,
      );
    }
    const json = await res.json();
    return json.mediaItems ?? [];
  }

  async function readErrorBody(res: Response) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        if (typeof json?.error === "string") return json.error;
        if (typeof json?.message === "string") return json.message;
        return JSON.stringify(json);
      } catch {
        return "Failed to parse JSON error body.";
      }
    }
    try {
      return await res.text();
    } catch {
      return "Unknown error body.";
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function buildPreviews() {
      Object.values(previewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
      previewUrlsRef.current = {};
      setPreviewUrls({});

      if (!token || items.length === 0) return;

      const next: Record<string, string> = {};

      for (const it of items) {
        const baseUrl = it.mediaFile?.baseUrl;
        const mime = it.mediaFile?.mimeType ?? "";
        if (!baseUrl || !mime.startsWith("image/")) continue;

        const sizedUrl = `${baseUrl}=w1000-h1000`;
        try {
          const res = await fetch(
            `/api/proxy?url=${encodeURIComponent(sizedUrl)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            },
          );
          if (!res.ok) continue;
          const blob = await res.blob();
          next[it.id] = URL.createObjectURL(blob);
        } catch {
          // ignore per-item failures
        }
      }

      previewUrlsRef.current = next;
      setPreviewUrls(next);
    }

    void buildPreviews();

    return () => {
      controller.abort();
      Object.values(previewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
      previewUrlsRef.current = {};
    };
  }, [items, token]);

  return (
    <>
      <style jsx global>{`
        @import url("https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.css");

        :root {
          --bg: #0a0a0c;
          --bg-2: #121217;
          --ink: #f3f4f6;
          --muted: #9aa0a6;
          --accent: #6ee7ff;
          --accent-2: #7c6cff;
          --card: #14141a;
          --stroke: #242430;
        }

        body {
          font-family: "Pretendard", system-ui, sans-serif;
          background: radial-gradient(
              900px 500px at 15% 10%,
              rgba(124, 108, 255, 0.18),
              transparent
            ),
            radial-gradient(
              900px 500px at 85% 20%,
              rgba(110, 231, 255, 0.14),
              transparent
            ),
            var(--bg);
          color: var(--ink);
        }
      `}</style>

      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[color:var(--accent-2)]">
                Google Photos Picker
              </p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
                큐레이션된 순간을 골라보세요
              </h1>
              <p className="mt-2 max-w-xl text-base text-white/70">
                구글 포토에서 이미지를 선택하고, 바로 미리보기로 확인하는
                데모입니다.
              </p>
            </div>

            <button
              onClick={startPickerFlow}
              disabled={!gisReady || loading}
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:-translate-y-0.5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-base">
                {loading ? "Loading..." : "Pick from Google Photos"}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs">
                ↗
              </span>
            </button>
          </header>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Session</h2>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  {sessionId ? `sessionId: ${sessionId}` : "sessionId: —"}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  {pickerUri ? `pickerUri: ${pickerUri}` : "pickerUri: —"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Status</h2>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  GIS: {gisReady ? "ready" : "loading"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Token: {token ? "ok" : "missing"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Items: {items.length}
                </span>
              </div>
              <p className="mt-3 text-xs text-white/60">
                이미지 미리보기는 권한이 필요한 baseUrl을 서버 proxy로 가져옵니다.
              </p>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold">Selected photos</h2>
              <span className="text-sm text-white/60">
                {items.length === 0 ? "Nothing yet" : `${items.length} items`}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-white/60">
                선택된 사진이 아직 없어요. 버튼을 눌러 Pickers를 시작해보세요.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((it) => {
                  const mime = it.mediaFile?.mimeType ?? "";
                  const previewUrl = previewUrls[it.id];

                  return (
                    <article
                      key={it.id}
                      className="overflow-hidden rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="aspect-[4/3] w-full bg-black/40">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={it.mediaFile?.filename ?? "Picked image"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-white/50">
                            {mime.startsWith("image/")
                              ? "Loading preview..."
                              : "No preview"}
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-xs text-white/70">
                        <div className="font-semibold text-white">
                          {it.mediaFile?.filename ?? "Untitled"}
                        </div>
                        <div className="mt-1">id: {it.id}</div>
                        <div className="mt-1">mime: {mime || "unknown"}</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
