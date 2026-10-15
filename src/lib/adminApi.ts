/**
 * The site runs with `trailingSlash: true` (next.config.ts), and Next.js answers EVERY slash-less
 * URL it matches with a 308 redirect to the trailing-slash version - including API routes, not
 * just pages (confirmed directly: GET/PUT/PATCH/DELETE to /api/content and /api/admin/pages/<id>
 * without a trailing slash all come back as a 308 to the slash-terminated URL, and the request
 * only reaches the real route handler on the ones that already have it).
 *
 * Browser fetch() does follow 307/308 and replay the same method + body per spec, so this mostly
 * goes unnoticed - until it doesn't: a request that drops its body/auth on that replay (a flaky
 * proxy, an older WebView, a network layer that doesn't treat 308 like 307) silently turns "Save"
 * or "Delete Permanently" into a no-op. admin/blogs/page.tsx already worked around this by hand
 * (see its `postUrl` helper and the comment on it); this is the same fix generalized so new admin
 * code can't reintroduce the bug by forgetting the trailing slash.
 *
 * Always build an admin/API fetch URL through this helper instead of a bare template string.
 */
export function adminApiUrl(path: string): string {
  const qIdx = path.indexOf("?");
  const base = qIdx === -1 ? path : path.slice(0, qIdx);
  const query = qIdx === -1 ? "" : path.slice(qIdx);
  return (base.endsWith("/") ? base : `${base}/`) + query;
}
