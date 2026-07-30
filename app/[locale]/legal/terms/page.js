import LegalPageLayout from "../LegalPageLayout";
import { TERMS_KO } from "@/app/components/legalContent";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Terms of Service | the LIFE memory" : "이용약관 | the LIFE memory",
    description: isEn
      ? "Terms of Service for the LIFE memory."
      : "더라이프메모리(the LIFE memory) 이용약관입니다.",
  };
}

export default async function TermsPage({ params }) {
  const { locale } = await params;
  return (
    <LegalPageLayout
      locale={locale}
      title={locale === "en" ? "Terms of Service" : "이용약관"}
      content={TERMS_KO}
    />
  );
}
