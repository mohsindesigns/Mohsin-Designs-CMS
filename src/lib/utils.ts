import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SAFE_HREF_SENTINEL_HOST = "__issafehref_base__.invalid";
const SAFE_HREF_ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Guards against javascript:/data:/vbscript: URLs in admin-entered href
 * fields (industry card links, FAQ CTA button links, etc.) being rendered as
 * a real navigable target - neither Next.js's <Link> nor React itself blocks
 * dangerous URL schemes on the href/action attribute, so this must be
 * checked at the point of render, not just relied on as client-side input
 * validation (a raw API call could bypass that entirely).
 *
 * Resolves the input against a fake base using the native WHATWG URL parser
 * instead of hand-rolled regexes: an earlier regex version of this check was
 * bypassed by embedding a tab/newline/CR inside the scheme word (e.g.
 * "java\tscript:...") - real browsers strip those characters before
 * resolving a URL's scheme, which the URL parser also does correctly by
 * construction, so relying on it closes that whole bug class instead of
 * trying to out-guess every way to spell it in a regex.
 */
export function isSafeHref(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  let resolved: URL;
  try {
    resolved = new URL(trimmed, `https://${SAFE_HREF_SENTINEL_HOST}/`);
  } catch {
    return false;
  }

  if (!SAFE_HREF_ALLOWED_SCHEMES.has(resolved.protocol)) return false;

  // mailto:/tel: have no meaningful host - the scheme check above is enough.
  if (resolved.protocol === "mailto:" || resolved.protocol === "tel:") return true;

  // Resolved to our own sentinel host: the input was a genuine relative
  // reference (a path, hash, or query string) with no host of its own - safe.
  if (resolved.hostname === SAFE_HREF_SENTINEL_HOST) return true;

  // Anything else specified its own host: either a fully-qualified absolute
  // URL, or a protocol-relative "//host" shorthand that inherits the current
  // page's scheme. Only the explicit, unambiguous http(s):// form is
  // allowed - "//host" reads like a same-site relative link while actually
  // navigating off-site, so it's rejected rather than silently followed.
  return /^https?:\/\//i.test(trimmed);
}

/**
 * Normalizes a URL, relative slug, anchor, or external link entered in CMS:
 * - Rejects dangerous pseudo-protocols (javascript:, data:, vbscript:)
 * - Automatically prepends leading "/" to internal relative slugs (e.g. "services/seo" -> "/services/seo")
 * - Converts "www.example.com" -> "https://www.example.com"
 * - Converts "//example.com" -> "https://example.com"
 * - Preserves "http://", "https://", "mailto:", "tel:", and "#anchor"
 */
export function normalizeHref(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Reject dangerous pseudo-protocols immediately
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "";
  }

  // Anchor links on current page
  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  // Allowed explicit protocols
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  // Protocol-relative //example.com -> https://example.com
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // www.example.com -> https://www.example.com
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Pure domain pattern like "domain.com/page" or "example.org"
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed) && !trimmed.startsWith("/")) {
    return `https://${trimmed}`;
  }

  // Relative internal path: ensure leading slash so Next.js doesn't append to current subroute!
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Resolves and validates a safe href from any link string.
 * Returns the normalized URL/path if valid and safe, or null otherwise.
 */
export function getValidHref(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const normalized = normalizeHref(url);
  if (!normalized) return null;
  return isSafeHref(normalized) ? normalized : null;
}

/**
 * Normalizes a Page slug: lowercases, strips leading/trailing slashes, and cleans each
 * "/"-separated segment (stray characters, spaces, trailing slashes) so the stored slug
 * always matches the clean URL path Next.js resolves at request time.
 */
export function normalizePageSlug(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((seg) => seg.trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/");
}

/**
 * Ensures all external/internal links in HTML string are "dofollow" by stripping "nofollow" from rel attribute.
 */
export function makeLinksDoFollow(html: string): string {
  if (!html) return html;
  
  // Target any <a> tag
  return html.replace(/<a\s+([^>]*?)>/gi, (match: string, attrs: string) => {
    // Check if the tag has a rel attribute
    const relRegex = /rel=(['"])(.*?)\1/gi;
    if (relRegex.test(attrs)) {
      // Clean the rel attribute
      const cleanedAttrs = attrs.replace(relRegex, (relMatch: string, quote: string, relValue: string) => {
        const cleanRel = relValue
          .split(/\s+/)
          .filter((val: string) => val.toLowerCase() !== 'nofollow')
          .join(' ')
          .trim();
        return cleanRel ? `rel=${quote}${cleanRel}${quote}` : '';
      });
      // Replace multiple spaces with a single space and trim
      const tidiedAttrs = cleanedAttrs.replace(/\s+/g, ' ').trim();
      return tidiedAttrs ? `<a ${tidiedAttrs}>` : '<a>';
    }
    return match;
  });
}

/**
 * Repairs broken UTF-8 CP1252/Windows-1252 Mojibake encoding character patterns.
 */
export function cleanMojibake(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(/ΓÇö/g, '—')  // em dash
    .replace(/ΓÇô/g, '–')  // en dash
    .replace(/ΓÇÖ/g, '’')  // curly apostrophe/single quote
    .replace(/ΓÇÿ/g, '‘')  // curly single quote open
    .replace(/ΓÇ£/g, '“')  // curly double quote open
    .replace(/ΓÇØ/g, '”')  // curly double quote close
    .replace(/ΓÇ¢/g, '•')  // bullet point
    .replace(/ΓÇª/g, '…')  // ellipsis
    .replace(/┬á/g, ' ')   // non-breaking space
    .replace(/├⌐/g, 'é')   // e-acute
    .replace(/├│/g, 'ó')   // o-acute
    .replace(/├á/g, 'à')   // a-grave
    .replace(/├¡/g, 'í')   // i-acute
    .replace(/├║/g, 'ú')   // u-acute
    .replace(/├▒/g, 'ñ')   // n-tilde
    .replace(/├ç/g, 'Ç')   // C-cedilla
    .replace(/├ä/g, 'Ä')   // A-umlaut
    .replace(/├ö/g, 'Ö')   // O-umlaut
    .replace(/├╝/g, 'ü')   // u-umlaut
    .replace(/├ñ/g, 'ä')   // a-umlaut
    .replace(/├╢/g, 'ö')   // o-umlaut
    .replace(/├ƒ/g, 'ß')   // eszett
    .replace(/┬░/g, '°')   // degree symbol
    .replace(/┬⌐/g, '©')   // copyright
    .replace(/┬«/g, '®')   // registered
    .replace(/Γäó/g, '™')  // trademark
    .replace(/ΓÇï/g, '')   // zero width space
    .replace(/ΓÇì/g, '')   // zero width joiner
    .replace(/ΓÇî/g, '')   // zero width non-joiner
    .replace(/ΓÇ/g, '');   // fallback residual markers
}

/**
 * Repairs broken UTF-8 CP1252/Windows-1252 Mojibake encoding character patterns recursively.
 */
export function sanitizeEncoding(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return cleanMojibake(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeEncoding(item));
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      res[key] = sanitizeEncoding(obj[key]);
    }
    return res;
  }
  return obj;
}

