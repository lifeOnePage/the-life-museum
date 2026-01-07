"use client";

import { useParams } from "next/navigation";

/** 보호막 - username이 없으면 렌더링하지 않음 */

export default function EditRecordsLayout({ children }) {
  const { username } = useParams();

  if (!username) return;
  return <>{children}</>;
}
