"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";
const CACHE_PREFIX = "record_cache_";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

function getCached(id) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + id);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + id);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCached(id, data) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + id,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // sessionStorage 용량 초과 등 무시
  }
}

/**
 * 레코드 데이터를 가져오고 sessionStorage에 캐싱한다.
 * /share → /walk 이동 시 두 번째 페이지는 캐시에서 즉시 반환.
 *
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useRecordData(id) {
  const cached = id ? getCached(id) : null;

  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const hit = getCached(id);
    if (hit) {
      setData(hit);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchRecord() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/v1/record/${id}`);
        if (!res.ok) throw new Error(`앨범을 불러올 수 없습니다 (${res.status})`);

        const result = await res.json();
        if (!result.ok || !result.data) throw new Error("앨범 데이터가 없습니다");

        if (!cancelled) {
          setCached(id, result.data);
          setData(result.data);
        }
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
