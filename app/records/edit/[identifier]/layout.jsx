"use client";

import { useParams } from "next/navigation";

/** 가드 - identifier가 없으면 렌더링하지 않음 */

export default function EditRecordsLayout({ children }) {
  const { identifier } = useParams();

  if (!identifier) return;
  return <>{children}</>;
}
