import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

function localeFromCountry(country) {
  return country?.trim().toUpperCase() === "KR" ? "ko" : "en";
}

async function detectLocaleByIP(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: AbortSignal.timeout(2000),
    });
    const country = await res.text();
    // ipapi 오류 응답(RateLimited 등)은 국가코드가 아니므로 en으로 처리됨
    return localeFromCountry(country);
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
    // 1순위: 호스팅 플랫폼이 넣어주는 지오 헤더(외부 호출 없음, 즉시/무료)
    //  - Vercel: x-vercel-ip-country / request.geo.country
    //  - Cloudflare: cf-ipcountry
    const geoCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.geo?.country ||
      "";

    let locale;
    if (geoCountry) {
      locale = localeFromCountry(geoCountry);
    } else {
      // 2순위: IP 기반 조회(로컬은 ko 기본)
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded
        ? forwarded.split(",")[0].trim()
        : request.headers.get("x-real-ip") || "";

      const isLocalhost =
        !ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
      locale = isLocalhost ? "ko" : await detectLocaleByIP(ip);
    }

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
  // .well-known: AASA(apple-app-site-association)는 확장자가 없어 .*\..* 예외에
  // 안 걸리므로 명시적으로 제외해야 함. 누락 시 /ko/.well-known/...로 308 리다이렉트되어
  // Apple이 AASA를 거부 → Universal Links 전체 실패.
  matcher: ["/((?!api|payment|_next/static|_next/image|favicon.ico|images|\\.well-known|.*\\..*).*)",],
};
