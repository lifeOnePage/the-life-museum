"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { authedFetch } from "@/app/utils/authedFetch";

const API_URL = "https://the-life-museum-backend-production.up.railway.app";

export function usePhotoDrive(record_id) {
  const [photoMedia, setPhotoMedia] = useState([]);
  const [photoBlobUrls, setPhotoBlobUrls] = useState([]);
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
        // Reset blob URLs so they get re-fetched for new media
        setPhotoBlobUrls([]);
      }
    } catch (err) {
      console.error("Photo drive refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [record_id]);

  const preloadBlobs = useCallback(() => {
    if (photoMedia.length === 0) return;
    setPhotoBlobUrls((prev) => {
      // Skip if already fully loaded
      if (prev.length === photoMedia.length && prev.every(Boolean)) return prev;
      const next = new Array(photoMedia.length).fill(null);
      // Preserve existing blobs
      for (let i = 0; i < Math.min(prev.length, photoMedia.length); i++) {
        if (prev[i]) next[i] = prev[i];
      }
      // Fetch missing blobs
      photoMedia.forEach(async (media, i) => {
        if (next[i]) return; // already loaded
        try {
          const rawUrl = media.original_url || media.thumbnail_url;
          const proxyUrl = `${API_URL}/api/v1/scraper/proxy/image?url=${encodeURIComponent(rawUrl)}`;
          const res = await fetch(proxyUrl);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          setPhotoBlobUrls((curr) => {
            const updated = [...curr];
            updated[i] = blobUrl;
            return updated;
          });
        } catch (e) {
          console.error("Blob preload failed:", e);
        }
      });
      return next;
    });
  }, [photoMedia]);

  return {
    photoMedia,
    photoBlobUrls,
    isRefreshing,
    isLoading,
    refresh,
    preloadBlobs,
  };
}
