import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import Page from "@/models/Page";
import { buildPageBreadcrumbs } from "./breadcrumbs";
import { resolveLocationPaths, type LocationIndex, type ResolvedLocation } from "./locationPath";

export { resolveLocationPaths, locationHref, DEFAULT_COUNTRY_SLUG } from "./locationPath";
export type { LocationIndex, ResolvedLocation } from "./locationPath";

/**
 * Normalizes a string into a clean, URL-safe slug.
 * Handles spaces, special characters, uppercase, and trimming.
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove accents
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

export interface LocationCheck {
  valid: boolean;
  /** Full page document for the matched location (use this instead of a second slug lookup). */
  page?: any;
  /** Canonical hierarchical path of the page ("usa/nevada/henderson"), no leading/trailing slash. */
  canonicalPath?: string;
  hierarchy?: {
    countrySlug: string;
    countryName?: string;
    stateSlug?: string;
    stateName?: string;
    citySlug?: string;
    cityName?: string;
  };
}

/**
 * One lightweight query per request (React `cache` de-duplicates generateMetadata + the page):
 * every published Country/State/City page, reduced to just the fields needed to work out its
 * place in the hierarchy (never the multi-hundred-KB `content`). Roughly a few hundred bytes per
 * page, so it stays cheap even with hundreds of cities, and it is only paid on ISR revalidation.
 */
export const getLocationIndex = cache(async (): Promise<LocationIndex> => {
  await connectToDatabase();
  const docs = await Page.find({
    template: { $in: ["country", "state", "city"] },
    status: "published",
    isTrashed: { $ne: true },
  })
    .select(
      "_id slug title template seo.canonicalUrl " +
        "content.countrySlug content.stateSlug content.citySlug content.parentLocationId content.parentLocationSlug " +
        "content.serviceArea.hubs.link content.serviceArea.hubs.href content.serviceArea.hubs.url"
    )
    .lean();
  return resolveLocationPaths(docs as any[]);
});

/**
 * Validates the Country -> State -> City hierarchy for an incoming dynamic-route slug and
 * returns the page that URL resolves to.
 *
 * URL scheme (the ONLY canonical form; see lib/locationPath.ts for how legacy flat pages are
 * placed into it):
 *   1 segment  [country]                 -> a published Country page
 *   2 segments [country, state]          -> a published State page whose country is `country`
 *   3 segments [country, state, city]    -> a published City page under exactly that state+country
 *
 * Returns { valid: true, page, canonicalPath, hierarchy } or { valid: false }.
 * NOTE: callers must render `page` from this result. Looking the page up again by
 * `slugSegments.join("/")` fails for pages whose stored slug is not the full path.
 */
export async function validateLocationHierarchy(slugSegments: string[]): Promise<LocationCheck> {
  if (!slugSegments || slugSegments.length === 0 || slugSegments.length > 3) return { valid: false };
  if (slugSegments.some((s) => typeof s !== "string" || !s)) return { valid: false };

  const index = await getLocationIndex();
  const entry = index.byPath.get(slugSegments.join("/"));
  if (!entry) return { valid: false };

  await connectToDatabase();
  const page = await Page.findOne({ _id: entry.id, status: "published", isTrashed: { $ne: true } }).lean();
  if (!page) return { valid: false };

  const country = index.byPath.get(entry.countrySlug);
  const state = entry.stateSlug ? index.byPath.get(`${entry.countrySlug}/${entry.stateSlug}`) : undefined;

  return {
    valid: true,
    page,
    canonicalPath: entry.path,
    hierarchy: {
      countrySlug: entry.countrySlug,
      countryName: country?.title || "United States",
      ...(entry.stateSlug ? { stateSlug: entry.stateSlug, stateName: state?.title || entry.stateSlug } : {}),
      ...(entry.citySlug ? { citySlug: entry.citySlug, cityName: entry.title || entry.citySlug } : {}),
    },
  };
}

/**
 * Canonical hierarchical path ("usa/nevada/henderson") for a country/state/city page document,
 * or null when it has none (parent chain cannot be determined / parent unpublished). Use this to
 * redirect legacy flat URLs (/nevada/, /henderson/) to the canonical URL instead of 404ing.
 */
export async function getCanonicalLocationPath(page: { _id?: any; slug?: string } | null | undefined): Promise<string | null> {
  if (!page) return null;
  const index = await getLocationIndex();
  const hit: ResolvedLocation | undefined = index.byId.get(String(page._id ?? page.slug));
  return hit ? hit.path : null;
}

/**
 * Makes a plain (JSON-cloned) location page object self-consistent with the URL it is served at,
 * so everything downstream (breadcrumbs, schema, canonical, templates) agrees:
 *  - slug becomes the canonical hierarchical path (legacy pages store just "nevada"/"henderson")
 *  - content.country/state/city and *Slug fields are filled in when the document never stored them
 * Existing content values always win. Returns the same object.
 */
export function applyLocationHierarchy<T extends { slug?: string; content?: any }>(page: T, check: LocationCheck): T {
  if (!page || !check?.valid || !check.canonicalPath) return page;
  const h = check.hierarchy;
  const c = { ...(page.content || {}) };
  if (h) {
    c.countrySlug = c.countrySlug || h.countrySlug;
    c.country = c.country || h.countryName;
    if (h.stateSlug) {
      c.stateSlug = c.stateSlug || h.stateSlug;
      c.state = c.state || h.stateName;
    }
    if (h.citySlug) {
      c.citySlug = c.citySlug || h.citySlug;
      c.city = c.city || h.cityName;
    }
  }
  page.slug = check.canonicalPath;
  page.content = c;
  return page;
}

/**
 * Builds breadcrumb trail for any location or standard page.
 * (Implementation lives in ./breadcrumbs so client components can share it.)
 */
export function buildLocationBreadcrumbs(page: any, slug: string): Array<{ name: string; url: string }> {
  return buildPageBreadcrumbs(page, slug);
}
