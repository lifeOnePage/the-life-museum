"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function LocaleRootPage() {
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    router.replace(`/${locale}/library`);
  }, [locale, router]);

  return null;
}
