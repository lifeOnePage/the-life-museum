import Link from "next/link";
import Footer from "@/app/components/Footer";

export default function LegalPageLayout({ locale, title, content }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#141210] text-white"
      style={{ fontFamily: "pretendard, system-ui, -apple-system, sans-serif" }}
    >
      <div className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <Link
            href={`/${locale}`}
            className="mb-8 inline-block text-xs text-white/30 transition hover:text-white/50"
          >
            {locale === "en" ? "← Back to home" : "← 홈으로"}
          </Link>
          <h1 className="mb-8 text-2xl font-semibold text-[#e8d5b7]">{title}</h1>
          <div className="text-sm leading-relaxed whitespace-pre-line text-[#c4b49a]">
            {content}
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
