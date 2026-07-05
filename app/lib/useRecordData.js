"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://the-life-museum-backend-production.up.railway.app";

// Module-level cache: record data persists across navigations within the session.
// Once media is fetched it is merged into the cached object, so subsequent hits
// return the full record+media payload without extra network calls.
//
// Entries are stored as { data, ts } and treated as stale-while-revalidate: a hit
// paints instantly from cache (no spinner), but EVERY mount re-fetches the cheap
// base record in the background and merges it with the cached mediaList — so edits
// made elsewhere (e.g. the VHS photo-frame in the editor) show up on the next view
// open without killing the app, and without re-running the expensive media scrape.
const recordCache = new Map();

/**
 * Drop a record's cached entry so the next useRecordData mount refetches it.
 * Call this after saving edits to that record so viewers pick up the change
 * immediately instead of serving the stale in-memory copy.
 * @param {string} id - record UUID
 */
export function invalidateRecord(id) {
  if (!id) return;
  // imagesOnly 변형 캐시 키까지 함께 무효화
  recordCache.delete(id);
  recordCache.delete(`${id}:img`);
}

/**
 * 레코드 데이터를 API에서 가져온다. 세션 내 같은 id는 캐시에서 즉시 반환.
 *
 * record 기본 데이터를 먼저 fetch한 뒤, media를 별도 엔드포인트에서 lazy fetch.
 *
 * @param {string} id - record UUID
 * @param {{ onMediaProgress?: (event: object) => void, imagesOnly?: boolean }} options
 *   onMediaProgress가 전달되면 Stage 2에서 SSE 스트림을 사용하여 진행 상황을 콜백으로 전달.
 *   imagesOnly=true면 영상을 제외한 이미지만 요청 (프로빙/트랜스코딩 스킵 → 빠른 로딩).
 *
 * @returns {{ data: object|null, loading: boolean, error: string|null, mediaLoading: boolean }}
 */
export function useRecordData(id, { onMediaProgress, imagesOnly = false } = {}) {
  // imagesOnly는 미디어 구성이 다르므로 캐시 키를 분리 (walk 등과 충돌 방지)
  const cacheKey = imagesOnly ? `${id}:img` : id;
  const [data, setData] = useState(() => recordCache.get(cacheKey)?.data ?? null);
  const [loading, setLoading] = useState(() => !recordCache.has(cacheKey));
  const [error, setError] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(
    () => !recordCache.has(cacheKey),
  );

  useEffect(() => {
    if (!id) return;

    const cached = recordCache.get(cacheKey);
    // Cache hit: paint instantly (no spinner) and revalidate the base record below.
    const hasStale = !!cached;
    if (hasStale) {
      setData(cached.data);
      setLoading(false);
      setMediaLoading(false);
    }

    let cancelled = false;

    async function fetchRecord() {
      try {
        if (!hasStale) {
          setLoading(true);
          setMediaLoading(true);
        }
        setError(null);

        // Stage 1: fetch record data (without mediaList)
        const res = await fetch(`${API_BASE}/api/v1/record/${id}`);
        if (!res.ok) throw new Error(`앨범을 불러올 수 없습니다 (${res.status})`);

        const result = await res.json();
        if (!result.ok || !result.data) throw new Error("앨범 데이터가 없습니다");

        // Revalidation path: merge the fresh base record with the cached mediaList
        // (media rarely changes and re-scraping is expensive) and skip Stage 2.
        if (hasStale) {
          const merged = {
            ...result.data,
            mediaList: cached.data.mediaList ?? [],
          };
          recordCache.set(cacheKey, { data: merged, ts: Date.now() });
          if (!cancelled) {
            setData(merged);
            setLoading(false);
            setMediaLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setData(result.data);
          setLoading(false);
        }

        // Stage 2: fetch media
        if (onMediaProgress) {
          // SSE stream mode: consume /media/stream for progress events
          try {
            const response = await fetch(`${API_BASE}/api/v1/record/${id}/media/stream${imagesOnly ? "?images_only=true" : ""}`);
            if (!response.ok) throw new Error(`SSE stream failed (${response.status})`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const parts = buffer.split('\n\n');
              buffer = parts.pop();
              for (const part of parts) {
                const line = part.trim();
                if (!line.startsWith('data: ')) continue;
                try {
                  const event = JSON.parse(line.slice(6));
                  if (event.type === 'progress') {
                    if (!cancelled) onMediaProgress(event);
                  } else if (event.type === 'complete') {
                    const merged = { ...result.data, mediaList: event.mediaList ?? [] };
                    recordCache.set(cacheKey, { data: merged, ts: Date.now() });
                    if (!cancelled) setData(merged);
                  }
                } catch {
                  // JSON parse error — skip malformed event
                }
              }
            }
          } catch {
            // SSE failed — fallback: cache record without media
            const merged = { ...result.data, mediaList: [] };
            recordCache.set(cacheKey, { data: merged, ts: Date.now() });
            if (!cancelled) setData(merged);
          } finally {
            if (!cancelled) setMediaLoading(false);
          }
        } else {
          // Legacy mode: single fetch to /media endpoint
          try {
            const mediaRes = await fetch(`${API_BASE}/api/v1/record/${id}/media${imagesOnly ? "?images_only=true" : ""}`);
            if (mediaRes.ok) {
              const mediaResult = await mediaRes.json();
              if (mediaResult.ok && mediaResult.data) {
                const merged = {
                  ...result.data,
                  mediaList: mediaResult.data.mediaList ?? [],
                };
                recordCache.set(cacheKey, { data: merged, ts: Date.now() });
                if (!cancelled) setData(merged);
              } else {
                const merged = { ...result.data, mediaList: [] };
                recordCache.set(cacheKey, { data: merged, ts: Date.now() });
                if (!cancelled) setData(merged);
              }
            } else {
              const merged = { ...result.data, mediaList: [] };
              recordCache.set(cacheKey, { data: merged, ts: Date.now() });
              if (!cancelled) setData(merged);
            }
          } catch {
            const merged = { ...result.data, mediaList: [] };
            recordCache.set(cacheKey, { data: merged, ts: Date.now() });
            if (!cancelled) setData(merged);
          } finally {
            if (!cancelled) setMediaLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          // Revalidation failure with a usable cached copy → keep showing the
          // cache silently instead of replacing the view with an error screen.
          if (!hasStale) setError(err.message);
          setLoading(false);
          setMediaLoading(false);
        }
      }
    }

    fetchRecord();
    return () => { cancelled = true; };
  }, [id, imagesOnly]);

  return { data, loading, error, mediaLoading };
}
