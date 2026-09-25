// Shared rules for the admin Pages API (route.ts + [id]/route.ts). Server-only.
//
// Kept in one place so the create / update / bulk / duplicate / delete handlers cannot drift apart
// on the things that must always agree: which slugs are allowed, what happens to redirects and
// canonicals when a slug changes, which caches to flush, and which page is "the homepage".

import { revalidatePath } from 'next/cache';
import Page from '@/models/Page';
import { BASE_URL } from '@/lib/constants';

export const LOCATION_TEMPLATES = ['country', 'state', 'city'];

// ---------------------------------------------------------------------------------------------
// Slug rules
// ---------------------------------------------------------------------------------------------

/** Root segments owned by Next.js / the admin / static assets - a CMS page there is unreachable. */
const ROOT_RESERVED = new Set([
  'admin', 'api', '_next', 'uploads', 'assets', 'cdn-images', 'json',
  'favicon.ico', 'sitemap.xml', 'robots.txt', 'llms.txt', 'llms.tsxt',
]);

/** Built-in static routes (src/app/privacy, src/app/terms) win over the CMS catch-all route. */
const STATIC_ROUTE_SLUGS = new Set(['privacy', 'terms']);

/** next.config.ts permanently redirects these before any page is looked up. */
const REDIRECTED_SLUGS: Record<string, string> = {
  contact: 'contact-us',
  about: 'about-us',
  'privacy-policy': 'privacy',
  'terms-of-service': 'terms',
};

/**
 * Dedicated routes that load their Page document by a fixed slug and always render one fixed
 * template. A page with that slug but another template would be shown with the wrong layout.
 */
const DEDICATED_SLUG_TEMPLATES: Record<string, string[]> = {
  gallery: ['gallery'],
  location: ['location', 'locations'],
  locations: ['location', 'locations'],
  blog: ['blog'],
  blogs: ['blog'],
};

/** Sub-paths of these are owned by other systems (services catalog / blog posts). */
const OWNED_PREFIXES: Record<string, string> = {
  services: 'the Services catalog (Admin > Services)',
  blogs: 'the Blog posts',
  blog: 'the Blog posts',
};

/** Reason why `template` cannot be used with the (dedicated-route) `slug`, else null. */
export function checkDedicatedSlugTemplate(slug: string, template?: string): string | null {
  const segs = slug.split('/').filter(Boolean);
  const first = segs[0];
  if (segs.length === 1 && template && DEDICATED_SLUG_TEMPLATES[first] && !DEDICATED_SLUG_TEMPLATES[first].includes(template)) {
    return `The slug "${first}" is served by a dedicated route that always uses the "${DEDICATED_SLUG_TEMPLATES[first][0]}" template. Use that template, or choose another slug.`;
  }
  return null;
}

/** Returns a human readable reason when `slug` (already normalised) cannot be used, else null. */
export function validatePageSlug(slug: string, template?: string): string | null {
  const segs = slug.split('/').filter(Boolean);
  if (segs.length === 0) return 'A valid slug is required.';
  const first = segs[0];

  if (ROOT_RESERVED.has(first)) {
    return `"${first}" is reserved by the system and cannot be used as the start of a page URL.`;
  }
  if (segs.length === 1 && STATIC_ROUTE_SLUGS.has(first)) {
    return `/${first}/ is a built-in page and cannot be replaced by a CMS page.`;
  }
  if (segs.length === 1 && REDIRECTED_SLUGS[first]) {
    return `/${first}/ permanently redirects to /${REDIRECTED_SLUGS[first]}/ (see next.config.ts), so a page with this slug could never be shown. Use "${REDIRECTED_SLUGS[first]}" instead.`;
  }
  if (segs.length > 1 && OWNED_PREFIXES[first]) {
    return `URLs under /${first}/ are handled by ${OWNED_PREFIXES[first]}, so a CMS page with this slug would never be shown. Choose a slug outside /${first}/.`;
  }
  return checkDedicatedSlugTemplate(slug, template);
}

// ---------------------------------------------------------------------------------------------
// Canonical URL helpers
// ---------------------------------------------------------------------------------------------

function ownHosts(): Set<string> {
  const hosts = new Set<string>(['mohsindesigns.com', 'www.mohsindesigns.com']);
  try {
    hosts.add(new URL(BASE_URL).host);
  } catch {}
  return hosts;
}

/** Path ("usa/texas", no slashes) of a URL on one of OUR hosts, or null for foreign hosts. */
function ownPath(url: string): string | null {
  try {
    const u = new URL(url, BASE_URL);
    if (!ownHosts().has(u.host)) return null;
    return u.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  } catch {
    return null;
  }
}

export function canonicalFor(slug: string): string {
  return `${BASE_URL}/${slug.replace(/^\/+|\/+$/g, '')}/`;
}

/**
 * New canonical for a page whose slug changed, or undefined to leave the canonical alone.
 * Only an EMPTY canonical, or one that is just the auto-generated URL of the OLD slug, is
 * rewritten. A hand-written canonical (another path, or another domain) is deliberately kept -
 * the previous code overwrote every canonical that was not explicitly edited in the same request.
 */
export function canonicalAfterSlugChange(current: string | undefined | null, oldSlug: string, newSlug: string): string | undefined {
  if (!current || !String(current).trim()) return canonicalFor(newSlug);
  const p = ownPath(String(current));
  if (p === null) return undefined; // foreign-domain canonical
  if (p === oldSlug.replace(/^\/+|\/+$/g, '').toLowerCase()) return canonicalFor(newSlug);
  return undefined;
}

// ---------------------------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------------------------

/** id of the page chosen in Settings > Homepage (undefined when "Default" is selected). */
export async function getHomepageId(): Promise<string | undefined> {
  try {
    const SiteContent = (await import('@/models/Content')).default;
    const doc: any = await SiteContent.findOne({ key: 'complete_data' }).select('data.settings.homepageId').lean();
    const id = doc?.data?.settings?.homepageId;
    return id ? String(id) : undefined;
  } catch {
    return undefined;
  }
}

/** True when "/" is currently rendered from this page (so it must not be trashed/unpublished/deleted). */
export function isLiveHomepage(page: { _id?: any; slug?: string; template?: string }, homepageId?: string): boolean {
  if (homepageId) return String(page._id) === homepageId;
  return page.template === 'home' && (page.slug === 'home' || page.slug === 'homepage');
}

export const HOMEPAGE_GUARD_MESSAGE =
  'This page is the site homepage. Choose a different homepage in Settings > General first, then trash, unpublish or delete it.';

// ---------------------------------------------------------------------------------------------
// Redirects
// ---------------------------------------------------------------------------------------------

/**
 * Keeps the Redirect collection consistent after `oldSlug` became `newSlug`:
 *  - removes any redirect whose SOURCE is the new URL (renaming A->B and later B->A used to leave
 *    A->B and B->A behind, i.e. an infinite redirect loop that made the page unreachable),
 *  - re-points redirects that already targeted the old URL (no A->B->C chains),
 *  - creates old -> new.
 */
export async function syncSlugRedirects(oldSlug: string, newSlug: string): Promise<void> {
  if (!oldSlug || !newSlug || oldSlug === newSlug) return;
  try {
    const Redirect = (await import('@/models/Redirect')).default;
    const oldPath = `/${oldSlug}`;
    const newTarget = `/${newSlug}/`;

    await Redirect.deleteMany({ isRegex: { $ne: true }, sourceUrl: { $in: [`/${newSlug}`, `/${newSlug}/`] } });
    await Redirect.updateMany(
      { isRegex: { $ne: true }, targetUrl: { $in: [`/${oldSlug}`, `/${oldSlug}/`] } },
      { $set: { targetUrl: newTarget } }
    );
    await Redirect.findOneAndUpdate(
      { sourceUrl: oldPath },
      {
        sourceUrl: oldPath,
        targetUrl: newTarget,
        statusCode: 301,
        queryParamMode: 'ignore',
        ignoreSlash: true,
        status: 'active',
        notes: `Auto-redirect on page slug change: ${oldPath} -> ${newTarget}`,
      },
      { upsert: true, new: true }
    );
    try {
      const { invalidateRedirectCache } = await import('@/app/api/redirects/match/route');
      invalidateRedirectCache();
    } catch {}
  } catch (err) {
    console.error('Failed to sync 301 redirects on page slug change:', err);
  }
}

// ---------------------------------------------------------------------------------------------
// Child pages (Country -> State -> City) follow their parent's slug
// ---------------------------------------------------------------------------------------------

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface ChildRename {
  id: string;
  oldSlug: string;
  newSlug: string;
  set: Record<string, any>;
}

/**
 * When a Country/State page's slug changes, its children's stored slugs ("usa/texas/dallas") and
 * parent fields would keep pointing at the old path and every city under it would 404. This
 * computes the follow-up renames; nothing is written. Returns an error string on a slug collision.
 */
export async function planChildRenames(
  page: { _id: any; template?: string },
  oldSlug: string,
  newSlug: string
): Promise<{ plan: ChildRename[]; error?: string }> {
  if (page.template !== 'country' && page.template !== 'state') return { plan: [] };

  const children: any[] = await Page.find({
    _id: { $ne: page._id },
    template: { $in: ['state', 'city'] },
    slug: { $regex: `^${escapeRegex(oldSlug)}/` },
  })
    .select('_id slug title seo.canonicalUrl content.countrySlug content.stateSlug content.parentLocationSlug')
    .lean();
  if (children.length === 0) return { plan: [] };

  const oldSegs = oldSlug.split('/');
  const newSegs = newSlug.split('/');

  const plan: ChildRename[] = children.map((c) => {
    const childNew = newSlug + c.slug.slice(oldSlug.length);
    const set: Record<string, any> = { slug: childNew };
    const cs = c.content || {};
    if (oldSegs[0] !== newSegs[0] && cs.countrySlug === oldSegs[0]) set['content.countrySlug'] = newSegs[0];
    if (oldSegs.length >= 2 && newSegs.length >= 2 && oldSegs[1] !== newSegs[1] && cs.stateSlug === oldSegs[1]) {
      set['content.stateSlug'] = newSegs[1];
    }
    if (typeof cs.parentLocationSlug === 'string' && (cs.parentLocationSlug === oldSlug || cs.parentLocationSlug.startsWith(`${oldSlug}/`))) {
      set['content.parentLocationSlug'] = newSlug + cs.parentLocationSlug.slice(oldSlug.length);
    }
    const canon = canonicalAfterSlugChange(c.seo?.canonicalUrl, c.slug, childNew);
    if (canon) set['seo.canonicalUrl'] = canon;
    return { id: String(c._id), oldSlug: c.slug, newSlug: childNew, set };
  });

  const ids = new Set(plan.map((p) => p.id));
  const clash: any[] = await Page.find({ slug: { $in: plan.map((p) => p.newSlug) } }).select('_id slug title').lean();
  const real = clash.filter((c) => !ids.has(String(c._id)));
  if (real.length > 0) {
    return { plan: [], error: `Cannot move this page: the child URL "${real[0].slug}" is already used by "${real[0].title}".` };
  }
  return { plan };
}

/** Writes a plan produced by planChildRenames (and its redirects). Returns how many were renamed. */
export async function applyChildRenames(plan: ChildRename[]): Promise<number> {
  let done = 0;
  for (const p of plan) {
    try {
      await Page.updateOne({ _id: p.id }, { $set: p.set });
      await syncSlugRedirects(p.oldSlug, p.newSlug);
      done++;
    } catch (err) {
      console.error(`Failed to move child page ${p.oldSlug} -> ${p.newSlug}:`, err);
    }
  }
  return done;
}

// ---------------------------------------------------------------------------------------------
// Cache invalidation
// ---------------------------------------------------------------------------------------------

/**
 * Flushes the ISR cache entries that can show a changed page.
 *  - the page URL(s) and every ancestor URL (a country/state page lists its children),
 *  - "/" (as before),
 *  - the dedicated routes that load a page by a fixed slug (/locations/, /blogs/),
 *  - ALL catch-all pages for location templates or slug moves (their public URL is built from the
 *    hierarchy, not just from the stored slug, and parents/children list each other),
 *  - the whole site for `global` (the homepage save rewrites site-wide content, which every page
 *    inherits - previously only "/" was refreshed so other pages could lag up to 60 s).
 * Never throws: a failed revalidation must not fail a save.
 */
export function revalidatePageCaches(opts: {
  slugs: Array<string | undefined | null>;
  template?: string;
  moved?: boolean;
  global?: boolean;
}): void {
  const paths = new Set<string>(['/']);
  for (const raw of opts.slugs) {
    const slug = String(raw || '').replace(/^\/+|\/+$/g, '');
    if (!slug) continue;
    const segs = slug.split('/');
    for (let i = 1; i <= segs.length; i++) paths.add('/' + segs.slice(0, i).join('/'));
    if (slug === 'location' || slug === 'locations') {
      paths.add('/locations');
      paths.add('/location');
    }
    if (slug === 'blog' || slug === 'blogs') {
      paths.add('/blogs');
      paths.add('/blog');
    }
  }

  const safe = (fn: () => void) => {
    try {
      fn();
    } catch (err) {
      console.error('Failed to revalidate path:', err);
    }
  };

  for (const p of paths) safe(() => revalidatePath(p));
  if ((opts.template && LOCATION_TEMPLATES.includes(opts.template)) || opts.moved) {
    safe(() => revalidatePath('/[...slug]', 'page'));
  }
  if (opts.global) safe(() => revalidatePath('/', 'layout'));
}

// ---------------------------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------------------------

export const PAGE_STATUSES = ['draft', 'published'];

/** Mongoose ValidationError -> a message an editor can act on. */
export function validationMessage(error: any): string | null {
  if (error?.name === 'ValidationError' && error.errors) {
    const first: any = Object.values(error.errors)[0];
    return first?.message || 'Validation failed.';
  }
  return null;
}
