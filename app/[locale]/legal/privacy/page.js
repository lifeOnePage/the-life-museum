import LegalPageLayout from "../LegalPageLayout";
import { PRIVACY_KO } from "@/app/components/legalContent";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Privacy Policy | the LIFE memory" : "개인정보처리방침 | the LIFE memory",
    description: isEn
      ? "Privacy Policy for the LIFE memory."
      : "더라이프메모리(the LIFE memory) 개인정보처리방침입니다.",
  };
}

export default async function PrivacyPage({ params }) {
  const { locale } = await params;
  return (
    <LegalPageLayout
      locale={locale}
      title={locale === "en" ? "Privacy Policy" : "개인정보처리방침"}
      content={PRIVACY_KO}
    />
  );
}
