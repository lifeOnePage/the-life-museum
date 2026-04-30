"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Home from "@/app/page.js";

export default function LocaleRootPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && token) {
      router.replace(`/${locale}/library`);
    }
  }, [loading, token, locale, router]);

  if (loading) return null;
  if (token) return null;

  return <Home />;
}
