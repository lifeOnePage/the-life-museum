"use client";
import { use } from "react";
import VHSExhibition from "./components/VHSExhibition";
import SmartAppBanner from "@/app/components/SmartAppBanner";

export default function VHSPage({ params }) {
  const { id, locale } = use(params);
  return (
    <div className="h-screen w-screen bg-black">
      <SmartAppBanner locale={locale} />
      <VHSExhibition recordId={id} locale={locale} />
    </div>
  );
}
