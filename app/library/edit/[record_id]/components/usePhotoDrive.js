"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { authedFetch } from "@/app/utils/authedFetch";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

export function usePhotoDrive(record_id) {
  const [photoMedia, setPhotoMedia] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  // 편집 페이지 진입 시 자동으로 미디어 fetch
  useEffect(() => {
    if (fetchedRef.current || !record_id) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const response = await authedFetch(
          `${API_URL}/api/v1/record/${record_id}/media`,
        );
        const result = await response.json();
        if (result.ok && result.data) {
          const images = (result.data.mediaList ?? []).filter(
            (m) => m.type === "image",
          );
          setPhotoMedia(images);
        }
      } catch (err) {
        console.error("Photo drive initial fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [record_id]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await authedFetch(
        `${API_URL}/api/v1/record/${record_id}/media`,
      );
      const result = await response.json();
      if (result.ok && result.data) {
        const images = (result.data.mediaList ?? []).filter(
          (m) => m.type === "image",
        );
        setPhotoMedia(images);
      }
    } catch (err) {
      console.error("Photo drive refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [record_id]);

  // 주의: 과거의 preloadBlobs(앨범 전체 원본을 프록시로 일괄 다운로드해 blob으로
  // 보관)는 제거됨 — 수천 장 앨범에서 GB 단위 메모리를 점유해 크래시 위험.
  // 사진은 선택 시 해당 1장만 온디맨드로 blob 변환한다.

  return {
    photoMedia,
    isRefreshing,
    isLoading,
    refresh,
  };
}
