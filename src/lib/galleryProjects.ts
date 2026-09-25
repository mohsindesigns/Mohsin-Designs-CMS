// Pure helpers used ONLY by the Gallery/Portfolio template (public page) and the
// GalleryEditor (admin), so both sides agree on how a "project" is read.
//
// Two project shapes reach the gallery grid:
//   1. "custom" cards written by GalleryEditor:   { id, brand, badge, tag, tech, subtitle, image, link }
//   2. catalog projects written by /admin/projects (global `portfolio.projects`, also what
//      "Select from Existing Projects" copies into `galleryPage.selectedProjects`):
//                                                 { title, subtitle, category, categories[], desc, image, location, year, stats[] ... }
// normalizeGalleryProject() maps both onto the card the template renders and NEVER invents
// data (no fake "+300% Growth" / "Next.js" pills): a field that is blank stays blank and the
// template simply omits that piece of the card.

import { getValidHref } from "@/lib/utils";

export interface GalleryCard {
  id: string;
  badge: string;
  brand: string;
  description: string;
  image: string;
  tag: string;
  tech: string[];
  link: string;
}

const clean = (v: any): string => (typeof v === "string" ? v.trim() : "");

/**
 * Accepts an array, or the object-with-numeric-keys shape ({0:{...},1:{...},enabled:false}) that
 * an older GalleryEditor produced when its visibility toggle spread the projects ARRAY into an
 * object. Anything else -> [].
 */
export function toProjectList(v: any): any[] {
  if (Array.isArray(v)) return v.filter((x) => x && typeof x === "object");
  if (v && typeof v === "object") {
    return Object.keys(v)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => v[k])
      .filter((x) => x && typeof x === "object");
  }
  return [];
}

const lower = (v: any) => clean(typeof v === "string" ? v : v == null ? "" : String(v)).toLowerCase();

/**
 * "Select from Existing Projects" stores COPIES of catalog projects. Resolve each copy back to the
 * live catalog entry so that:
 *  - edits made later in Admin > Projects show up on the gallery, and
 *  - projects deleted from the catalog disappear from the gallery instead of lingering as stale copies.
 * Matching order: stable id (_id / id / slug) -> title -> cover image (so a renamed project still matches by
 * picture, and a catalog that gained ids later still matches copies that were taken before). Duplicates collapse.
 * With no catalog available (empty/unloaded) nothing can be verified, so the copies are kept as-is.
 */
export function resolveSelectedProjects(selected: any[], catalog: any[]): { resolved: any[]; stale: any[] } {
  const sel = toProjectList(selected);
  const cat = toProjectList(catalog);
  if (cat.length === 0) return { resolved: sel, stale: [] };

  const byId = new Map<string, number>();
  const byTitle = new Map<string, number>();
  const byImage = new Map<string, number>();
  cat.forEach((c, i) => {
    for (const id of [c._id, c.id, c.slug]) {
      const k = lower(id);
      if (k && !byId.has(k)) byId.set(k, i);
    }
    const t = lower(c.title || c.name || c.brand);
    if (t && !byTitle.has(t)) byTitle.set(t, i);
    const img = clean(c.image);
    if (img && !byImage.has(img)) byImage.set(img, i);
  });

  const used = new Set<number>();
  const resolved: any[] = [];
  const stale: any[] = [];
  for (const s of sel) {
    let idx: number | undefined;
    for (const id of [s._id, s.id, s.slug]) {
      const k = lower(id);
      if (idx === undefined && k && byId.has(k)) idx = byId.get(k);
    }
    if (idx === undefined) {
      const t = lower(s.title || s.name || s.brand);
      if (t && byTitle.has(t)) idx = byTitle.get(t);
    }
    if (idx === undefined) {
      const img = clean(s.image);
      if (img && byImage.has(img)) idx = byImage.get(img);
    }
    if (idx === undefined) {
      stale.push(s);
    } else if (!used.has(idx)) {
      used.add(idx);
      resolved.push(cat[idx]);
    }
  }
  return { resolved, stale };
}

/** Maps any supported project shape onto the card fields. `categoryLabels` = { categoryId: label } from the global portfolio.categories. */
export function normalizeGalleryProject(p: any, idx: number, categoryLabels: Record<string, string> = {}): GalleryCard {
  const isCatalog = !clean(p?.brand) && !!clean(p?.title);

  // Tech pills: array, "a, b, c" string or legacy `tags`. Catalog projects have none, so show where/when instead.
  let tech: string[] = [];
  if (Array.isArray(p?.tech)) tech = p.tech;
  else if (typeof p?.tech === "string") tech = p.tech.split(",");
  else if (Array.isArray(p?.tags)) tech = p.tags;
  tech = tech.map((t) => clean(String(t ?? ""))).filter(Boolean);
  if (tech.length === 0 && isCatalog) tech = [clean(p.location), clean(p.year)].filter(Boolean);

  // Outcome chip: explicit tag/outcome, else the first filled "case study" stat ("48% Boost").
  const stats: any[] = Array.isArray(p?.stats) ? p.stats : [];
  const firstStat = stats.find((s) => s && (clean(s.value) || clean(s.label)));
  const tag =
    clean(p?.tag) || clean(p?.outcome) || (firstStat ? [clean(firstStat.value), clean(firstStat.label)].filter(Boolean).join(" ") : "");

  // Category badge: explicit badge/category, else the label of the first assigned filter tab.
  const cats: any[] = Array.isArray(p?.categories) ? p.categories : [];
  const catLabel = cats.map((id) => clean(categoryLabels[String(id)])).find(Boolean) || "";
  const badge = clean(p?.badge) || clean(p?.category) || catLabel || (isCatalog ? clean(p?.subtitle) : "");

  // Description: custom cards keep the subtitle; catalog projects use their (longer) description and
  // only fall back to the tagline when it was not already spent as the badge.
  const description = isCatalog
    ? clean(p?.desc) || clean(p?.description) || (clean(p?.subtitle) !== badge ? clean(p?.subtitle) : "")
    : clean(p?.subtitle) || clean(p?.desc) || clean(p?.description);

  const link = getValidHref(clean(p?.link));

  return {
    id: String(p?.id || p?._id || idx + 1),
    badge,
    brand: clean(p?.brand) || clean(p?.title) || `Project ${idx + 1}`,
    description,
    image: clean(p?.image),
    tag,
    tech,
    link: link && link !== "#" ? link : "",
  };
}

/** Builds { id: label } from global portfolio.categories (ignoring the synthetic "all" tab). */
export function categoryLabelMap(categories: any): Record<string, string> {
  const map: Record<string, string> = {};
  if (Array.isArray(categories)) {
    for (const c of categories) {
      if (c && c.id && c.id !== "all" && clean(c.label)) map[String(c.id)] = clean(c.label);
    }
  }
  return map;
}
