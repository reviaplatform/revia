import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let locales = ['en', 'ar'];
export let defaultLocale = 'ar'; // MVP focus on Egypt, Arabic default

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/') || pathname.includes('/api/v1/') || pathname.includes('/auth/');

  const hasRefreshToken = request.cookies.has('refreshToken');

  // Route protection for dashboard
  if (pathname.includes('/dashboard')) {
    if (!hasRefreshToken) {
      // API call -> 401 JSON (Ensures no RSC/HTML payload is returned to fetch calls)
      if (isApi) {
        return NextResponse.json(
          {
            status: 'error',
            error: { code: 401, message: 'invalidAccessToken' }
          },
          { status: 401 }
        );
      }

      // Page Navigation -> Redirect
      const match = pathname.match(/^\/(en|ar)(\/|$)/);
      const lang = match ? match[1] : defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${lang}`;
      url.searchParams.set('auth', 'required');
      return NextResponse.redirect(url);
    }
  }

  // Locale redirection handling
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale || isApi) return;

  // Redirect if there is no locale
  // Consider Accept-Language header here for a more robust implementation
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;

  // e.g. incoming request is /about
  // The new URL is now /ar/about
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Must match everything except specific static patterns
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
