import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const ADMIN_COOKIE = 'mohsin_admin_session';
const PUBLIC_PATHS = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password'
];

interface RedirectRule {
  _id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  queryParamMode?: string;
  ignoreCase?: boolean;
  ignoreSlash?: boolean;
  isRegex?: boolean;
}

let cachedRules: { rules: RedirectRule[]; expiresAt: number } | null = null;
const RULES_CACHE_TTL_MS = 60000; // 60 seconds

function matchRedirectRule(rule: RedirectRule, pathname: string, search: string): string | null {
  const fullUrl = pathname + search;
  let requestPath = pathname;

  if (rule.isRegex) {
    const flags = rule.ignoreCase ? 'i' : '';
    try {
      const regex = new RegExp(rule.sourceUrl, flags);
      const pathMatch = requestPath.match(regex);
      if (pathMatch) {
        let replacedTarget = rule.targetUrl;
        for (let i = 1; i < pathMatch.length; i++) {
          replacedTarget = replacedTarget.replace(new RegExp(`\\$${i}`, 'g'), pathMatch[i] || '');
        }
        return replacedTarget;
      }
    } catch {}
    return null;
  }

  let redirectPath = rule.sourceUrl;
  const qIdx = redirectPath.indexOf('?');
  if (qIdx !== -1) redirectPath = redirectPath.substring(0, qIdx);

  let normReq = requestPath;
  let normRed = redirectPath;

  if (rule.ignoreSlash) {
    normReq = normReq === '/' ? normReq : normReq.replace(/\/$/, '');
    normRed = normRed === '/' ? normRed : normRed.replace(/\/$/, '');
  }

  if (rule.ignoreCase) {
    normReq = normReq.toLowerCase();
    normRed = normRed.toLowerCase();
  }

  if (normReq === normRed) {
    return rule.targetUrl;
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Check for global redirects (only for public HTML pages, not API, admin, assets, dev tools)
  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/uploads') &&
    !pathname.startsWith('/assets') &&
    !pathname.startsWith('/json') &&
    pathname !== '/favicon.ico' &&
    pathname !== '/sitemap.xml' &&
    pathname !== '/robots.txt' &&
    pathname !== '/llms.txt' &&
    pathname !== '/llms.tsxt'
  ) {
    const now = Date.now();

    // Refresh rules cache only once every 60s
    if (!cachedRules || cachedRules.expiresAt <= now) {
      try {
        const internalBase = process.env.INTERNAL_API_URL || new URL('/', req.url).origin;
        const matchUrl = new URL('/api/redirects/match', internalBase);
        matchUrl.searchParams.set('url', '__rules__');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120);

        const res = await fetch(matchUrl.toString(), {
          headers: { 'x-internal-request': 'true' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          cachedRules = {
            rules: Array.isArray(data?.rules) ? data.rules : [],
            expiresAt: now + RULES_CACHE_TTL_MS
          };
        }
      } catch {
        // Non-fatal: bypass if busy
      }
    }

    // Evaluate rules strictly in-memory (0ms overhead)
    if (cachedRules && cachedRules.rules.length > 0) {
      for (const rule of cachedRules.rules) {
        const matched = matchRedirectRule(rule, pathname, req.nextUrl.search);
        if (matched) {
          let target = matched;
          if (target.startsWith('/')) {
            target = new URL(target, req.url).toString();
          }
          return NextResponse.redirect(target, rule.statusCode || 301);
        }
      }
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

