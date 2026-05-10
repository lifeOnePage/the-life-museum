"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

// Module-level cache: record data persists across navigations within the session.
// Once media is fetched it is merged into the cached object, so subsequent hits
// return the full record+media payload without extra network calls.
const recordCache = new Map();

/**
 * 레코드 데이터를 API에서 가져온다. 세션 내 같은 id는 캐시에서 즉시 반환.
 *
 * record 기본 데이터를 먼저 fetch한 뒤, media를 별도 엔드포인트에서 lazy fetch.
 *
 * @returns {{ data: object|null, loading: boolean, error: string|null, mediaLoading: boolean }}
 */
export function useRecordData(id) {
  const [data, setData] = useState(() => recordCache.get(id) ?? null);
  const [loading, setLoading] = useState(() => !recordCache.has(id));
  const [error, setError] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(
    () => !recordCache.has(id),
  );

  useEffect(() => {
    if (!id) return;
    if (recordCache.has(id)) return; // already cached (record + media merged)

    let cancelled = false;

    async function fetchRecord() {
      try {
        setLoading(true);
        setMediaLoading(true);
        setError(null);

        // Stage 1: fetch record data (without mediaList)
        const res = await fetch(`${API_BASE}/api/v1/record/${id}`);
        if (!res.ok) throw new Error(`앨범을 불러올 수 없습니다 (${res.status})`);

        const result = await res.json();
        if (!result.ok || !result.data) throw new Error("앨범 데이터가 없습니다");

        if (!cancelled) {
          setData(result.data);
          setLoading(false);
        }

        // Stage 2: fetch media separately
        try {
          const mediaRes = await fetch(`${API_BASE}/api/v1/record/${id}/media`);
          if (mediaRes.ok) {
            const mediaResult = await mediaRes.json();
            if (mediaResult.ok && mediaResult.data) {
              const merged = {
                ...result.data,
                mediaList: mediaResult.data.mediaList ?? [],
              };
              recordCache.set(id, merged);
              if (!cancelled) setData(merged);
            } else {
              // media endpoint returned ok:false — cache record without media
              const merged = { ...result.data, mediaList: [] };
              recordCache.set(id, merged);
              if (!cancelled) setData(merged);
            }
          } else {
            // media endpoint failed — cache record without media
            const merged = { ...result.data, mediaList: [] };
            recordCache.set(id, merged);
            if (!cancelled) setData(merged);
          }
        } catch {
          // media fetch threw — cache record without media
          const merged = { ...result.data, mediaList: [] };
          recordCache.set(id, merged);
          if (!cancelled) setData(merged);
        } finally {
          if (!cancelled) setMediaLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
          setMediaLoading(false);
        }
      }
    }

    fetchRecord();
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error, mediaLoading };
}
