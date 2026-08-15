import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const ADMIN_COOKIE = 'admin_session';
const PUBLIC_PATHS = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Check for global redirects (only for public pages, not API, admin, next assets, uploads)
  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/uploads') &&
    !pathname.startsWith('/assets') &&
    pathname !== '/favicon.ico' &&
    pathname !== '/sitemap.xml' &&
    pathname !== '/robots.txt' &&
    pathname !== '/llms.txt' &&
    pathname !== '/llms.tsxt'
  ) {
    try {
      // Use INTERNAL_API_URL to avoid external round-trip through Cloudflare in production.
      // In local dev this falls back to the request origin (e.g. http://localhost:3000).
      const internalBase = process.env.INTERNAL_API_URL || new URL('/', req.url).origin;
      const matchUrl = new URL('/api/redirects/match', internalBase);
      matchUrl.searchParams.set('url', pathname + req.nextUrl.search);
      
      const res = await fetch(matchUrl.toString(), {
        headers: {
          'x-internal-request': 'true'
        }
      });
      
      if (res.ok) {
        const redirectData = await res.json();
        if (redirectData && redirectData.targetUrl) {
          let target = redirectData.targetUrl;
          if (target.startsWith('/')) {
            target = new URL(target, req.url).toString();
          }
          return NextResponse.redirect(target, redirectData.statusCode || 301);
        }
      }
    } catch (err) {
      console.error('Middleware redirect check error:', err);
    }
  }

  // 2. Only run authentication on /admin routes
  if (pathname.startsWith('/admin')) {
    // Allow login page through without auth
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

    // Check for session cookie
    const session = req.cookies.get(ADMIN_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate JWT session
    try {
      const payload = await verifyToken(session.value);
      if (!payload) {
        throw new Error('Invalid token');
      }
      return NextResponse.next();
    } catch (error) {
      const loginUrl = new URL('/admin/login', req.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(ADMIN_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (local public assets)
     * - uploads (uploaded media)
     * - sitemap.xml, robots.txt, llms.txt, llms.tsxt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|uploads|sitemap.xml|robots.txt|llms.txt|llms.tsxt).*)',
  ],
};

