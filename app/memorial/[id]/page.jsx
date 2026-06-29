"use client";
import { use } from "react";
import MemorialExhibition from "./components/MemorialExhibition";
import SmartAppBanner from "@/app/components/SmartAppBanner";

export default function MemorialPage({ params }) {
  const { id, locale } = use(params);
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SmartAppBanner locale={locale} />
      <MemorialExhibition recordId={id} locale={locale} />
    </div>
  );
}
