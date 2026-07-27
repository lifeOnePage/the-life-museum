"use client";
import { use, useEffect } from "react";
import VHSExhibition from "./components/VHSExhibition";
import SmartAppBanner from "@/app/components/SmartAppBanner";

export default function VHSPage({ params }) {
  const { id, locale } = use(params);

  // VHS 감상 중 컨텍스트 메뉴 차단:
  // - PC: 마우스 우클릭 / - Android: 롱프레스 컨텍스트 메뉴 → contextmenu preventDefault
  // - iOS: 롱프레스 이미지 콜아웃(저장 등) → -webkit-touch-callout / user-select none
  // createPortal로 body에 붙는 클로즈업까지 커버하기 위해 document/body 레벨에 적용.
  useEffect(() => {
    const blockContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockContextMenu);

    const body = document.body.style;
    const prev = {
      callout: body.webkitTouchCallout,
      userSelect: body.userSelect,
      webkitUserSelect: body.webkitUserSelect,
    };
    body.webkitTouchCallout = "none";
    body.userSelect = "none";
    body.webkitUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      body.webkitTouchCallout = prev.callout;
      body.userSelect = prev.userSelect;
      body.webkitUserSelect = prev.webkitUserSelect;
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black">
      <SmartAppBanner locale={locale} />
      <VHSExhibition recordId={id} locale={locale} />
    </div>
  );
}
