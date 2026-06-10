"use client";

import { Capacitor } from "@capacitor/core";

/** Capacitor 네이티브 앱 환경인지 확인 */
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/** 현재 플랫폼 반환: "ios" | "android" | "web" */
export function getPlatform() {
  return Capacitor.getPlatform();
}
