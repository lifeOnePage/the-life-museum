"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

/**
 * 레코드 데이터를 API에서 항상 새로 가져온다.
 *
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useRecordData(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchRecord() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/v1/record/${id}`);
        if (!res.ok) throw new Error(`앨범을 불러올 수 없습니다 (${res.status})`);

        const result = await res.json();
        if (!result.ok || !result.data) throw new Error("앨범 데이터가 없습니다");

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
