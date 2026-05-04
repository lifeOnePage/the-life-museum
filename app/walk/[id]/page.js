"use client";
import { use } from "react";
import DisplayScene from "./components/displayScene";

export default function WalkPage({ params }) {
  const { id, locale } = use(params);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <DisplayScene recordId={id} locale={locale} />
    </div>
  );
}
