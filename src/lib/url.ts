// Pure (client + server safe) URL helpers.
//
// next.config has `trailingSlash: true`, so every page URL is canonically
// "/about-us/". Hrefs written without the slash still work, but only after a
// 308 redirect and they show the "wrong" URL on hover. Normalise them here.

const rawBase = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();
let SITE_HOST = "mohsindesigns.com";
try {
  if (rawBase) SITE_HOST = new URL(rawBase).hostname.replace(/^www\./, "");
} catch {
  /* keep default */
}

// Never touched: API routes, Next internals, proxied assets.
const SKIP_PREFIXES = ["/api/", "/_next/", "/cdn-images/"];

function slashPath(pathAndRest: string): string {
  const m = pathAndRest.match(/^([^?#]*)(.*)$/);
  if (!m) return pathAndRest;
  const [, path, rest] = m;
  if (!path || path.endsWith("/")) return pathAndRest;
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return pathAndRest;
  // A dot in the last segment means a file (llms.txt, sitemap.xml, logo.png).
  if ((path.split("/").pop() || "").includes(".")) return pathAndRest;
  return `${path}/${rest}`;
}

/**
 * Adds the trailing slash to an internal page href, preserving ?query and #hash.
 * External links, mailto:/tel:, hash-only links, files and API paths are returned
 * unchanged. Same-site absolute URLs (https://mohsindesigns.com/x) are normalised too.
 */
export function withTrailingSlash<T extends string | null | undefined>(href: T): T {
  if (!href || typeof href !== "string") return href;
  const value = href.trim();

  if (value.startsWith("/") && !value.startsWith("//")) {
    return slashPath(value) as T;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.hostname.replace(/^www\./, "") !== SITE_HOST) return href;
      const fixed = slashPath(`${url.pathname}${url.search}${url.hash}`);
      return `${url.origin}${fixed}` as T;
    } catch {
      return href;
    }
  }

  // "#x", "mailto:", "tel:", "javascript:", "//cdn...", relative "foo" -> leave as is.
  return href;
}

/** Rewrites internal <a href> values inside an HTML string (rich-text content). */
export function normalizeHtmlLinks(html: string): string {
  if (!html || typeof html !== "string") return html;
  return html.replace(/(<a\s[^>]*?\bhref=)(["'])(.*?)\2/gi, (_m, pre: string, q: string, url: string) => {
    return `${pre}${q}${withTrailingSlash(url)}${q}`;
  });
}
