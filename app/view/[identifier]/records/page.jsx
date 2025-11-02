"use client";
import { useEffect, useState } from "react";
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

  return (
    <>
      {width <= 768 ? (
        <LifeRecordMobile data={data} />
      ) : (
        <LifeRecordDesktop data={data} />
      )}
    </>
  );
}
