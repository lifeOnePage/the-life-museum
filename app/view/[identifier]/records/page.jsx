"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import LifeRecordDesktop from "./components/LifeRecordDesktop";
import LifeRecordMobile from "./components/LifeRecordMobile";
import "./styles/cardPage.css";
import "./styles/cardPage-mobile.css";

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export default function ViewRecordsPage() {
  const { identifier } = useParams();
  const { width } = useWindowSize();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 데스크탑/모바일 전환 시 autoSlideEnabled 상태 유지를 위한 공유 상태
  // 데스크탑 view: true (default), 모바일 view: false (default)
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(() => {
    // 초기 마운트 시 window 객체가 있으면 실제 width 사용
    if (typeof window !== "undefined") {
      return window.innerWidth > 768 ? true : false;
    }
    return false; // SSR fallback
  });
  const isInitializedRef = useRef(false);
  const prevWidthRef = useRef(width);

  useEffect(() => {
    if (!identifier) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/records/view/${encodeURIComponent(identifier)}`,
          {
            cache: "no-store",
          },
        );
        const json = await res.json().catch(() => ({}));

        if (res.ok && json?.ok) {
          setData(json.item);
          setError(null);
        } else {
          setError(json?.error || "데이터를 불러올 수 없습니다.");
        }
      } catch (e) {
        console.error("[view records] load error:", e);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [identifier]);

  if (loading) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        불러오는 중…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-black-100 grid min-h-screen w-screen place-items-center text-white/80">
        <div className="text-center">
          <p className="mb-4 text-xl">
            {error || "데이터를 찾을 수 없습니다."}
          </p>
          <p className="text-sm text-white/60">identifier: {identifier}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!isInitializedRef.current && width > 0) {
      isInitializedRef.current = true;
      const initialValue = width > 768 ? true : false;
      setAutoSlideEnabled(initialValue);
      prevWidthRef.current = width;
    }
  }, [width]);

  return (
    <>
      {width <= 768 ? (
        <LifeRecordMobile
          data={data}
          autoSlideEnabled={autoSlideEnabled}
          onAutoSlideEnabledChange={setAutoSlideEnabled}
        />
      ) : (
        <LifeRecordDesktop
          data={data}
          autoSlideEnabled={autoSlideEnabled}
          onAutoSlideEnabledChange={setAutoSlideEnabled}
        />
      )}
    </>
  );
}
