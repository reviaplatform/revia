import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

const intlMiddleware = createMiddleware({
    locales,
    localePrefix,
    defaultLocale: 'en'
});

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Extract token from cookies
    const token = request.cookies.get('providerAccessToken')?.value;

    // Check if the path is a dashboard path
    const isDashboardPath = pathname.includes('/dashboard');
    const isAuthPath = pathname.includes('/login') || pathname.includes('/signup');

    // Handle dashboard protection
    if (isDashboardPath && !token) {
        const segments = pathname.split('/');
        const locale = segments[1];
        const targetLocale = locales.includes(locale as any) ? locale : 'en';
        return NextResponse.redirect(new URL(`/${targetLocale}/login`, request.url));
    }

    // Handle auth redirection if already logged in
    if (isAuthPath && token) {
        const segments = pathname.split('/');
        const locale = segments[1];
        const targetLocale = locales.includes(locale as any) ? locale : 'en';
        return NextResponse.redirect(new URL(`/${targetLocale}/dashboard`, request.url));
    }

    return intlMiddleware(request);
}

export const config = {
    // Matcher for both localized and non-localized paths
    // Exclude internal paths and public assets
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
