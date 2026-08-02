import LegalPageLayout from "../LegalPageLayout";
import { REFUND_KO } from "@/app/components/legalContent";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Refund & Cancellation Policy | the LIFE memory"
      : "환불 및 취소정책 | the LIFE memory",
    description: isEn
      ? "Refund and cancellation policy for the LIFE memory."
      : "더라이프메모리(the LIFE memory) 환불 및 취소정책입니다.",
  };
}

export default async function RefundPolicyPage({ params }) {
  const { locale } = await params;
  return (
    <LegalPageLayout
      locale={locale}
      title={locale === "en" ? "Refund & Cancellation Policy" : "환불 및 취소정책"}
      content={REFUND_KO}
    />
  );
}
