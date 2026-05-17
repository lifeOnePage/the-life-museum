"use client";

const IMP_CODE = "imp22125511";
const PG = "tosspayments.iamporttest_3";

let scriptLoaded = false;

/** iamport 스크립트 로드 */
function loadIamportScript() {
  return new Promise((resolve, reject) => {
    if (scriptLoaded && window.IMP) {
      resolve(window.IMP);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.onload = () => {
      scriptLoaded = true;
      window.IMP.init(IMP_CODE);
      resolve(window.IMP);
    };
    script.onerror = () => reject(new Error("Failed to load iamport SDK"));
    document.head.appendChild(script);
  });
}

/**
 * 앨범 단건 결제 요청 (PortOne V1 팝업 방식)
 * @returns {Promise<object>} 결제 성공 시 { imp_uid, merchant_uid, ... }
 */
export async function requestAlbumPayment({ userId, userName, userEmail, locale = "ko" }) {
  const IMP = await loadIamportScript();

  const merchantUid = `album_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  return new Promise((resolve, reject) => {
    IMP.request_pay(
      {
        pg: PG,
        pay_method: "card",
        merchant_uid: merchantUid,
        name: locale === "ko" ? "앨범 1권 구매" : "Album Purchase (1)",
        amount: 10000,
        buyer_name: userName || undefined,
        buyer_email: userEmail || undefined,
        // 모바일 결제 완료 후 리다이렉트 URL
        m_redirect_url: `${window.location.origin}/payment/success`,
      },
      (rsp) => {
        if (rsp.success) {
          resolve(rsp);
        } else {
          reject(new Error(rsp.error_msg || "결제가 취소되었습니다."));
        }
      },
    );
  });
}
