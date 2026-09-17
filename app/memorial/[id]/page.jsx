"use client";
import { use } from "react";
import MemorialExhibition from "./components/MemorialExhibition";
import SmartAppBanner from "@/app/components/SmartAppBanner";

export default function MemorialPage({ params, searchParams }) {
  const { id, locale } = use(params);
  const sp = use(searchParams);
  // 편집 화면 미리보기 패널이 iframe으로 임베드할 때 ?preview=1
  const preview = sp?.preview === "1";
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {!preview && <SmartAppBanner locale={locale} />}
      <MemorialExhibition recordId={id} locale={locale} preview={preview} />
    </div>
  );
}
