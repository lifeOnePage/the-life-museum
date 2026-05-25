"use client";
import { use } from "react";
import VHSExhibition from "./components/VHSExhibition";

export default function VHSPage({ params }) {
  const { id, locale } = use(params);
  return <VHSExhibition recordId={id} locale={locale} />;
}
