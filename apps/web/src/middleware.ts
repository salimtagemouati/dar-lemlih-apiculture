import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/routing';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const protectedRoutes = new Set(['account', 'orders', 'checkout']);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

export function middleware(req: NextRequest) {
  // 1. Handle locale routing using next-intl
  const res = intlMiddleware(req);

  // 2. Handle Authentication
  const { pathname } = req.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const isLocale = locales.includes(segments.at(0) as "ar" | "fr" | "en");
  const locale = isLocale ? segments.at(0) : defaultLocale;
  const section = isLocale ? segments.at(1) : segments.at(0);

  if (section && protectedRoutes.has(section)) {
    const hasSession = req.cookies.has('dar-lemlih-token');

    if (!hasSession) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('redirectTo', `${req.nextUrl.pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}
