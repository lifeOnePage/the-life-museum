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
    // 지오 헤더로 국가 판별(외부 호출 없음, 즉시/무료)
    // ⚠️ 이 사이트는 Cloudflare(프록시) → Vercel(오리진) 구조라,
    // Vercel은 실제 방문자가 아니라 Cloudflare IP를 봄. 따라서 실제 방문자
    // 국가가 담긴 Cloudflare의 cf-ipcountry를 최우선으로 사용해야 함.
    //  - Cloudflare: cf-ipcountry (실제 방문자 국가, 신뢰)
    //  - Vercel: x-vercel-ip-country / request.geo.country (CF 뒤에선 부정확할 수 있음)
    const cfCountry = request.headers.get("cf-ipcountry");
    const geoCountry =
      (cfCountry && cfCountry !== "XX" ? cfCountry : "") ||
      request.headers.get("x-vercel-ip-country") ||
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
  matcher: ["/((?!api|payment|coupon-admin|_next/static|_next/image|favicon.ico|images|\\.well-known|.*\\..*).*)",],
};
