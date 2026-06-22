"use client";
import { use } from "react";
import DisplayScene from "./components/displayScene";
import SmartAppBanner from "@/app/components/SmartAppBanner";

export default function WalkPage({ params }) {
  const { id, locale } = use(params);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SmartAppBanner locale={locale} />
      <DisplayScene recordId={id} locale={locale} />
    </div>
  );
}
