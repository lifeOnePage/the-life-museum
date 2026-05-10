"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

// Module-level cache: record data persists across navigations within the session.
// Avoids re-triggering the backend's slow scrape_media_list on every visit.
const recordCache = new Map();

/**
 * 레코드 데이터를 API에서 가져온다. 세션 내 같은 id는 캐시에서 즉시 반환.
 *
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useRecordData(id) {
  const [data, setData] = useState(() => recordCache.get(id) ?? null);
  const [loading, setLoading] = useState(() => !recordCache.has(id));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    if (recordCache.has(id)) return; // already cached

    let cancelled = false;

    async function fetchRecord() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/v1/record/${id}`);
        if (!res.ok) throw new Error(`앨범을 불러올 수 없습니다 (${res.status})`);

        const result = await res.json();
        if (!result.ok || !result.data) throw new Error("앨범 데이터가 없습니다");

        recordCache.set(id, result.data);
        if (!cancelled) setData(result.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecord();
    return () => { cancelled = true; };
  }, [id]);

  return { data, loading, error };
}
