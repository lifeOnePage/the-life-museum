"use client";

import dynamic from "next/dynamic";

// R3F는 클라이언트 전용이므로 dynamic import 권장
const RingPlanesDemo = dynamic(
  () => import("./RingPlanesDemo"),
  { ssr: false }
);

export default function Page() {
  return <RingPlanesDemo />;
}
