import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

async function detectLocaleByIP(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: AbortSignal.timeout(2000),
    });
    const country = await res.text();
    return country.trim() === "KR" ? "ko" : "en";
  } catch {
    return "en";
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if already has a locale prefix
  const hasLocale = routing.locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const hasCookie = cookieLocale && routing.locales.includes(cookieLocale);

  // If no locale in path and no cookie → detect by IP, set cookie, redirect
  if (!hasLocale && !hasCookie) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "";

    const isLocalhost =
      !ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
    const locale = isLocalhost ? "ko" : await detectLocaleByIP(ip);

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)",],
};
