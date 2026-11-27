import Redirect from '@/models/Redirect';

// A relative path saved without a leading slash can never match a real request: middleware.ts
// compares it directly against req.nextUrl.pathname, which always starts with "/" - so
// "old-page" (missing its "/") silently never fires, with no error anywhere to flag it. Applied
// only to non-regex sourceUrl (a regex pattern's literal text matters) and to a relative
// (non-absolute-URL, non-anchor) targetUrl.
//
// Shared by src/app/api/admin/redirects/route.ts (single add/edit) and
// src/app/api/admin/redirects/import/route.ts (bulk import) so both paths apply the exact
// same normalization/loop-prevention rules and can never drift apart.
export function withLeadingSlash(path: string): string {
  const trimmed = (path || "").trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("#")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

// Helper to normalize path for loop checking
export function normalizePathForLoopCheck(urlStr: string) {
  if (!urlStr) return '';
  let path = urlStr;
  try {
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const u = new URL(urlStr);
      path = u.pathname + u.search;
    }
  } catch {}

  let p = path.trim().toLowerCase();
  if (p !== '/' && p.endsWith('/')) {
    p = p.slice(0, -1);
  }
  if (!p.startsWith('/')) {
    p = '/' + p;
  }
  return p;
}

// Loop checker algorithm - single-rule version, used by the existing POST/PUT routes.
// Fetches the current active-redirect map from the DB on every call.
export async function isRedirectLoop(sourceUrl: string, targetUrl: string, excludeId?: string): Promise<boolean> {
  const redirects = await Redirect.find({ status: 'active' }).lean();
  const redirectMap = new Map<string, string>();
  for (const r of redirects as any[]) {
    if (excludeId && r._id.toString() === excludeId) continue;
    redirectMap.set(normalizePathForLoopCheck(r.sourceUrl), normalizePathForLoopCheck(r.targetUrl));
  }
  return isRedirectLoopWithMap(sourceUrl, targetUrl, redirectMap);
}

// Same cycle-detection traversal as isRedirectLoop, but takes an already-built source->target
// map instead of querying the DB. Lets a bulk import build the active-redirects map ONCE for
// the whole batch (instead of re-querying per row) while still correctly detecting loops formed
// either against existing DB redirects or against earlier rows already added within this same
// batch (the caller mutates/extends redirectMap as rows are committed).
export function isRedirectLoopWithMap(sourceUrl: string, targetUrl: string, redirectMap: Map<string, string>): boolean {
  const normSource = normalizePathForLoopCheck(sourceUrl);
  const normTarget = normalizePathForLoopCheck(targetUrl);

  if (normSource === normTarget) {
    return true; // Direct self-redirect
  }

  // Build a traversal map that includes the proposed redirect without mutating the caller's map.
  const traversalMap = new Map(redirectMap);
  traversalMap.set(normSource, normTarget);

  let current = normTarget;
  const visited = new Set<string>([normSource]);

  while (current) {
    if (visited.has(current)) {
      return true; // Cycle detected!
    }
    visited.add(current);
    const next = traversalMap.get(current);
    if (!next) break;
    current = next;
  }

  return false;
}

// Builds the source->target map of all currently-active redirects, for bulk operations that
// need to check many candidate rules against the same snapshot without re-querying per row.
export async function buildActiveRedirectMap(excludeId?: string): Promise<Map<string, string>> {
  const redirects = await Redirect.find({ status: 'active' }).lean();
  const redirectMap = new Map<string, string>();
  for (const r of redirects as any[]) {
    if (excludeId && r._id.toString() === excludeId) continue;
    redirectMap.set(normalizePathForLoopCheck(r.sourceUrl), normalizePathForLoopCheck(r.targetUrl));
  }
  return redirectMap;
}
