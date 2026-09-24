"use client";

import { Agentation } from "agentation";

// 개발 환경 전용 — 페이지 요소를 클릭·주석 달아 MCP 서버(4747)로 보내는 툴바
export default function AgentationToolbar() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation endpoint="http://localhost:4747" />;
}
