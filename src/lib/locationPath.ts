// Pure (client-safe) Country -> State -> City URL resolution.
// No DB / server imports on purpose: the server route, the sitemap and admin UIs can all share it.
//
// URL SCHEME (single source of truth for every location link on the site)
//   Country:  /{country}/                 e.g. /usa/
//   State:    /{country}/{state}/         e.g. /usa/nevada/
//   City:     /{country}/{state}/{city}/  e.g. /usa/nevada/henderson/
// A location page's DB `slug` IS that whole path ("usa/nevada", "usa/nevada/henderson"); admin
// created pages and scripts/migrate_location_hierarchy.cjs always store it that way.
//
// LEGACY DATA: pages created before the hierarchy work are stored flat ("nevada", "henderson") and
// carry no parent fields at all. They used to be unreachable (the route forbids 1-segment
// state/city URLs and never found a flat slug under the 2/3-segment URL). Until the migration
// script has been run, this resolver infers the parent chain of such pages from data that already
// exists on them, so every page still has exactly ONE canonical URL:
//   state -> country :  slug prefix > content.countrySlug > content.parentLocationId(country) >
//                       content.parentLocationSlug > seo.canonicalUrl > default country
//   city  -> state   :  slug prefix > content.stateSlug > content.parentLocationId(state) >
//                       content.parentLocationSlug > seo.canonicalUrl > a link to the city from a
//                       state page's Service Area hubs (owner-authored child links)
// A page whose chain cannot be determined has no canonical URL (path === null): it is not served
// and not listed in the sitemap rather than being guessed.

export const DEFAULT_COUNTRY_SLUG = "usa";

export type LocationTemplate = "country" | "state" | "city";

export interface LocationDoc {
  _id?: any;
  slug?: string;
  title?: string;
  template?: string;
  seo?: { canonicalUrl?: string } | null;
  content?: {
    countrySlug?: string;
    stateSlug?: string;
    citySlug?: string;
    parentLocationId?: any;
    parentLocationSlug?: string;
    serviceArea?: { hubs?: Array<{ link?: string; href?: string; url?: string } | null> } | null;
  } | null;
}

export interface ResolvedLocation {
  id: string;
  template: LocationTemplate;
  title: string;
  /** slug as stored in the DB */
  slug: string;
  /** canonical hierarchical path, no leading/trailing slash ("usa/nevada/henderson") */
  path: string;
  countrySlug: string;
  stateSlug?: string;
  citySlug?: string;
  /** true when `path` differs from the stored slug (legacy flat page resolved by inference) */
  inferred: boolean;
}

export interface LocationIndex {
  /** Only fully valid chains (country exists -> state exists -> city). Keyed by canonical path. */
  byPath: Map<string, ResolvedLocation>;
  byId: Map<string, ResolvedLocation>;
  /** Location docs whose chain could not be determined (not routable). */
  unresolved: ResolvedLocation[];
}

/** "/Usa//Texas/" -> ["usa","texas"] */
export function cleanSegments(input?: string | null): string[] {
  if (!input || typeof input !== "string") return [];
  return input
    .trim()
    .toLowerCase()
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Path segments of a URL or path ("https://x.com/usa/nevada/" -> ["usa","nevada"]). */
export function pathSegmentsOfUrl(url?: string | null): string[] {
  if (!url || typeof url !== "string") return [];
  try {
    return cleanSegments(new URL(url.trim(), "http://local.invalid").pathname);
  } catch {
    return [];
  }
}

const lastOf = (segs: string[]) => segs[segs.length - 1] || "";
const lastSegment = (v?: string | null) => lastOf(cleanSegments(v));

/** Canonical public URL path ("/usa/nevada/") for a resolved location. */
export function locationHref(path?: string | null): string {
  return path ? `/${path.replace(/^\/+|\/+$/g, "")}/` : "";
}

export function resolveLocationPaths(docs: LocationDoc[]): LocationIndex {
  const list = (Array.isArray(docs) ? docs : []).filter(
    (d) => d && (d.template === "country" || d.template === "state" || d.template === "city") && d.slug
  );
  const idOf = (d: LocationDoc) => String(d._id ?? d.slug);

  const byPath = new Map<string, ResolvedLocation>();
  const byId = new Map<string, ResolvedLocation>();
  const unresolved: ResolvedLocation[] = [];

  const add = (loc: ResolvedLocation) => {
    // An explicitly stored path always beats an inferred one that lands on the same URL.
    const existing = byPath.get(loc.path);
    if (existing && !existing.inferred) return;
    if (existing && loc.inferred) return;
    byPath.set(loc.path, loc);
    byId.set(loc.id, loc);
  };

  // ---- 1. Countries ---------------------------------------------------------------------------
  const countries = list.filter((d) => d.template === "country");
  const countryPathById = new Map<string, string>();
  const countrySlugs = new Set<string>();
  for (const d of countries) {
    const path = cleanSegments(d.slug).join("/");
    if (!path) continue;
    countrySlugs.add(path);
    countryPathById.set(idOf(d), path);
    add({
      id: idOf(d),
      template: "country",
      title: (d.title || path).trim(),
      slug: d.slug as string,
      path,
      countrySlug: path,
      inferred: false,
    });
  }
  const fallbackCountry = countrySlugs.has(DEFAULT_COUNTRY_SLUG)
    ? DEFAULT_COUNTRY_SLUG
    : countrySlugs.size === 1
      ? Array.from(countrySlugs)[0]
      : DEFAULT_COUNTRY_SLUG;

  // ---- 2. States ------------------------------------------------------------------------------
  interface StateRow { doc: LocationDoc; loc: ResolvedLocation; }
  const states: StateRow[] = [];
  for (const d of list.filter((x) => x.template === "state")) {
    const segs = cleanSegments(d.slug);
    if (segs.length === 0) continue;
    const own = lastOf(segs);
    const c = d.content || {};

    let country = "";
    if (segs.length >= 2) country = segs[0]; // slug prefix is the truth
    if (!country && c.countrySlug) country = lastSegment(c.countrySlug);
    if (!country && c.parentLocationId != null) country = countryPathById.get(String(c.parentLocationId)) || "";
    if (!country && c.parentLocationSlug && countrySlugs.has(cleanSegments(c.parentLocationSlug).join("/"))) {
      country = cleanSegments(c.parentLocationSlug).join("/");
    }
    if (!country) {
      const canon = pathSegmentsOfUrl(d.seo?.canonicalUrl);
      if (canon.length === 2 && countrySlugs.has(canon[0]) && canon[1] === own) country = canon[0];
    }
    if (!country) country = fallbackCountry;

    const path = `${country}/${own}`;
    const loc: ResolvedLocation = {
      id: idOf(d),
      template: "state",
      title: (d.title || own).trim(),
      slug: d.slug as string,
      path,
      countrySlug: country,
      stateSlug: own,
      inferred: cleanSegments(d.slug).join("/") !== path,
    };
    states.push({ doc: d, loc });
    if (countrySlugs.has(country)) add(loc);
    else unresolved.push(loc); // country page missing/unpublished -> not routable
  }

  // Owner-authored child links: a state page's Service Area hub that points at /{c}/{state}/{city}/
  // proves that city belongs to that state. Keyed "stateSeg/citySeg".
  const hubPairs = new Set<string>();
  for (const { doc, loc } of states) {
    const hubs = doc.content?.serviceArea?.hubs;
    if (!Array.isArray(hubs)) continue;
    for (const hub of hubs) {
      if (!hub) continue;
      const p = pathSegmentsOfUrl(hub.link || hub.href || hub.url);
      if (p.length >= 2 && p[p.length - 2] === loc.stateSlug) hubPairs.add(`${loc.stateSlug}/${p[p.length - 1]}`);
    }
  }
  const stateRowsBySeg = new Map<string, StateRow[]>();
  const stateRowById = new Map<string, StateRow>();
  for (const row of states) {
    const arr = stateRowsBySeg.get(row.loc.stateSlug as string) || [];
    arr.push(row);
    stateRowsBySeg.set(row.loc.stateSlug as string, arr);
    stateRowById.set(row.loc.id, row);
  }

  // ---- 3. Cities ------------------------------------------------------------------------------
  for (const d of list.filter((x) => x.template === "city")) {
    const segs = cleanSegments(d.slug);
    if (segs.length === 0) continue;
    const own = lastOf(segs);
    const c = d.content || {};

    // Evidence for the parent state, strongest first: slug prefix, explicit content fields,
    // parent id / slug, SEO canonical URL, then a state page's hub link to this city. The first
    // source that yields a state segment wins; an explicit-but-wrong value does NOT fall through
    // to weaker guesses (it would silently re-home the page).
    let stateSeg = "";
    let countryHint = "";

    if (segs.length >= 3) {
      countryHint = segs[0];
      stateSeg = segs[segs.length - 2];
    } else if (segs.length === 2) {
      stateSeg = segs[0]; // legacy "/state/city" era
    }
    if (!stateSeg && c.stateSlug) {
      stateSeg = lastSegment(c.stateSlug);
      countryHint = c.countrySlug ? lastSegment(c.countrySlug) : "";
    }
    if (!stateSeg && c.parentLocationId != null) {
      const parent = stateRowById.get(String(c.parentLocationId));
      if (parent) {
        stateSeg = parent.loc.stateSlug as string;
        countryHint = parent.loc.countrySlug;
      }
    }
    if (!stateSeg && c.parentLocationSlug) {
      const ps = cleanSegments(c.parentLocationSlug);
      if (ps.length >= 1) {
        stateSeg = ps[ps.length - 1];
        countryHint = ps.length >= 2 ? ps[0] : "";
      }
    }
    if (!stateSeg) {
      const canon = pathSegmentsOfUrl(d.seo?.canonicalUrl);
      if (canon.length >= 2 && lastOf(canon) === own && stateRowsBySeg.has(canon[canon.length - 2])) {
        stateSeg = canon[canon.length - 2];
        countryHint = canon.length >= 3 ? canon[0] : "";
      }
    }
    if (!stateSeg) {
      const owners = Array.from(stateRowsBySeg.keys()).filter((s) => hubPairs.has(`${s}/${own}`));
      if (owners.length === 1) stateSeg = owners[0];
    }

    let row: StateRow | undefined;
    if (stateSeg) {
      const candidates = (stateRowsBySeg.get(stateSeg) || []).filter((r) => !countryHint || r.loc.countrySlug === countryHint);
      if (candidates.length === 1 || (candidates.length > 1 && countryHint)) row = candidates[0];
    }

    if (!row) {
      unresolved.push({
        id: idOf(d), template: "city", title: (d.title || own).trim(), slug: d.slug as string,
        path: "", countrySlug: countryHint, stateSlug: stateSeg || undefined, citySlug: own, inferred: true,
      });
      continue;
    }

    const path = `${row.loc.countrySlug}/${row.loc.stateSlug}/${own}`;
    const loc: ResolvedLocation = {
      id: idOf(d),
      template: "city",
      title: (d.title || own).trim(),
      slug: d.slug as string,
      path,
      countrySlug: row.loc.countrySlug,
      stateSlug: row.loc.stateSlug,
      citySlug: own,
      inferred: cleanSegments(d.slug).join("/") !== path,
    };
    // The parent state must itself be routable (published, country exists).
    if (byPath.get(row.loc.path)?.id === row.loc.id) add(loc);
    else unresolved.push(loc);
  }

  return { byPath, byId, unresolved };
}
