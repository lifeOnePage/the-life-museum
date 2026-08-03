import Link from "next/link";

const T = {
  ko: {
    company: "상호명",
    bizNo: "사업자등록번호",
    contact: "연락처",
    email: "문의 이메일",
    address: "사업장주소",
    ceo: "대표자명",
    mailOrderNo: "통신판매신고번호",
    terms: "이용약관",
    privacy: "개인정보처리방침",
    refund: "환불 및 취소정책",
  },
  en: {
    company: "Company",
    bizNo: "Business Registration No.",
    contact: "Contact",
    email: "Contact Email",
    address: "Address",
    ceo: "CEO",
    mailOrderNo: "Mail-order Business No.",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    refund: "Refund & Cancellation Policy",
  },
};

const INFO = {
  company: "(주) 메타메모리즈",
  bizNo: "396-88-03037",
  contact: "070-5236-4839",
  email: "nextfuturerec@gmail.com",
  address: "서울시 마포구 월드컵로 196, 비105-디195",
  ceo: "김주섭",
  mailOrderNo: "2024-서울마포-2029",
};

export default function Footer({ locale = "ko" }) {
  const t = T[locale] || T.ko;

  return (
    <footer className="border-t border-white/10 bg-[#121212] px-4 py-6 text-xs text-[#9b8b7a]">
      <div className="mx-auto mb-2 flex max-w-4xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <Link
          href={`/${locale}/legal/terms`}
          className="underline underline-offset-2 transition hover:text-[#c4b49a]"
        >
          {t.terms}
        </Link>
        <Link
          href={`/${locale}/legal/privacy`}
          className="underline underline-offset-2 transition hover:text-[#c4b49a]"
        >
          {t.privacy}
        </Link>
        <Link
          href={`/${locale}/legal/refund`}
          className="underline underline-offset-2 transition hover:text-[#c4b49a]"
        >
          {t.refund}
        </Link>
      </div>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        <span>
          {t.company} {INFO.company}
        </span>
        <span className="opacity-40">|</span>
        <span>
          {t.bizNo} {INFO.bizNo}
        </span>
        <span className="opacity-40">|</span>
        <span>
          {t.contact} {INFO.contact}
        </span>
        <span className="opacity-40">|</span>
        <span>
          {t.email}{" "}
          <a
            href={`mailto:${INFO.email}`}
            className="underline underline-offset-2 transition hover:text-[#c4b49a]"
          >
            {INFO.email}
          </a>
        </span>
        <span className="opacity-40">|</span>
        <span>
          {t.ceo} {INFO.ceo}
        </span>
        <span className="opacity-40">|</span>
        <span>
          {t.mailOrderNo} {INFO.mailOrderNo}
        </span>
      </div>
      <div className="mt-1 text-center">
        <span>
          {t.address} {INFO.address}
        </span>
      </div>
    </footer>
  );
}
