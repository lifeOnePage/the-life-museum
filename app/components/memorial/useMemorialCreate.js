"use client";

import { useCallback, useRef, useState } from "react";
import { authedFetch } from "@/app/utils/authedFetch";
import { invalidateRecord } from "@/app/lib/useRecordData";

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

// 인제스트 완료 폴링: 2.5s 간격, 최대 ~3분 (초과 시 백그라운드 계속 진행 안내)
const POLL_INTERVAL_MS = 2500;
const POLL_MAX_TRIES = 72;

async function pollIngestStatus(recordId, onProgress) {
  for (let i = 0; i < POLL_MAX_TRIES; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    try {
      const res = await authedFetch(
        `${API_BASE}/api/v1/record/${recordId}/memorial-media/status`,
      );
      const json = await res.json();
      if (json.ok && json.data) {
        onProgress?.(json.data);
        if (json.data.done) return json.data;
      }
    } catch {
      // 일시 오류는 다음 폴링에서 재시도
    }
  }
  return null; // 타임아웃 — 서버에서는 계속 진행됨
}

/**
 * 추모 앨범 생성/전환 공용 제출 훅.
 * 생성 모달과 전환 모달이 같은 진행 상태 머신을 공유한다.
 *
 * phase: idle | uploading | creating | registering | processing | done | error
 */
export function useMemorialCreate() {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(null); // { ready, failed, total } | { uploaded, total }
  const [error, setError] = useState(null);
  const [record, setRecord] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const busyRef = useRef(false);

  const finish = useCallback(async (newRecord) => {
    invalidateRecord(newRecord.id);
    setRecord(newRecord);
    setPhase("done");
    busyRef.current = false;
    return newRecord;
  }, []);

  const fail = useCallback((e) => {
    setError(e?.message || "잠시 후 다시 시도해주세요");
    setPhase("error");
    busyRef.current = false;
    throw e;
  }, []);

  /**
   * 신규 추모 앨범 생성 + 미디어 등록.
   * media: { source: "google_picker"|"upload", accessToken?, items:[{url,type,mimeType?}] }
   */
  const create = useCallback(
    async ({ title, subTitle, media }) => {
      if (busyRef.current) return null;
      busyRef.current = true;
      setError(null);
      setTimedOut(false);
      try {
        setPhase("creating");
        const res = await authedFetch(`${API_BASE}/api/v1/record`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || null,
            subTitle: subTitle || "",
            recordType: "memorial",
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json?.detail || json?.message || "앨범 생성에 실패했습니다");
        }
        const newRecord = json.data;

        setPhase("registering");
        const mediaRes = await authedFetch(
          `${API_BASE}/api/v1/record/${newRecord.id}/memorial-media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(media),
          },
        );
        const mediaJson = await mediaRes.json();
        if (!mediaRes.ok || !mediaJson.ok) {
          throw new Error(
            mediaJson?.detail || "미디어 등록에 실패했습니다 — 편집 화면에서 다시 시도해주세요",
          );
        }

        setPhase("processing");
        const status = await pollIngestStatus(newRecord.id, setProgress);
        if (!status) setTimedOut(true);
        return await finish(newRecord);
      } catch (e) {
        fail(e);
      }
    },
    [finish, fail],
  );

  /** 기존 앨범 → 추모 앨범 전환 (새 앨범 생성, 원본 유지). */
  const convert = useCallback(
    async ({ sourceRecordId, title, subTitle, items }) => {
      if (busyRef.current) return null;
      busyRef.current = true;
      setError(null);
      setTimedOut(false);
      try {
        setPhase("creating");
        const res = await authedFetch(
          `${API_BASE}/api/v1/record/${sourceRecordId}/convert-to-memorial`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title || null,
              subTitle: subTitle || null,
              items,
            }),
          },
        );
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(
            json?.detail || json?.message || "전환에 실패했습니다",
          );
        }
        const newRecord = json.data.record;

        setPhase("processing");
        const status = await pollIngestStatus(newRecord.id, setProgress);
        if (!status) setTimedOut(true);
        return await finish(newRecord);
      } catch (e) {
        fail(e);
      }
    },
    [finish, fail],
  );

  const setUploadProgress = useCallback((uploaded, total) => {
    setPhase("uploading");
    setProgress({ uploaded, total });
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(null);
    setError(null);
    setRecord(null);
    setTimedOut(false);
    busyRef.current = false;
  }, []);

  return {
    phase,
    progress,
    error,
    record,
    timedOut,
    busy: phase !== "idle" && phase !== "done" && phase !== "error",
    create,
    convert,
    setUploadProgress,
    reset,
  };
}
