import connectToDatabase from "@/lib/mongodb";
import Page from "@/models/Page";
import { BASE_URL } from "@/lib/constants";

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
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

/**
 * Validates the Country -> State -> City hierarchy for incoming dynamic route slugs.
 * 
 * Rules:
 * - 3 segments: [country, state, city] -> Must match a published City page under that exact Country and State.
 * - 2 segments: [country, state] -> Must match a published State page under that exact Country.
 * - 1 segment: [country] -> Must match a published Country page.
 * 
 * Returns { valid: true, page, hierarchy: { country, state, city } } or { valid: false }.
 */
export async function validateLocationHierarchy(slugSegments: string[]): Promise<{
  valid: boolean;
  page?: any;
  hierarchy?: {
    countrySlug: string;
    countryName?: string;
    stateSlug?: string;
    stateName?: string;
    citySlug?: string;
    cityName?: string;
  };
}> {
  if (!slugSegments || slugSegments.length === 0) return { valid: false };

  await connectToDatabase();

  const [countrySlug, stateSlug, citySlug] = slugSegments;

  // 1. Three-segment location: /[country]/[state]/[city]/
  if (slugSegments.length === 3) {
    // Exact slug lookup: e.g. "usa/texas/fort-worth"
    const fullSlug = `${countrySlug}/${stateSlug}/${citySlug}`;
    const cityDoc = await Page.findOne({
      slug: fullSlug,
      template: "city",
      status: "published",
      isTrashed: { $ne: true }
    }).lean();

    if (!cityDoc) {
      return { valid: false };
    }

    // Validate that the parent State exists and belongs to Country
    const stateDoc = await Page.findOne({
      $or: [
        { slug: `${countrySlug}/${stateSlug}` },
        { slug: stateSlug }
      ],
      template: "state",
      status: "published",
      isTrashed: { $ne: true }
    }).lean();

    if (!stateDoc) {
      return { valid: false };
    }

    // Validate that the parent Country exists
    const countryDoc = await Page.findOne({
      slug: countrySlug,
      template: "country",
      status: "published",
      isTrashed: { $ne: true }
    }).lean();

    if (!countryDoc) {
      return { valid: false };
    }

    return {
      valid: true,
      page: cityDoc,
      hierarchy: {
        countrySlug,
        countryName: countryDoc.title || "United States",
        stateSlug,
        stateName: stateDoc.title || stateSlug,
        citySlug,
        cityName: (cityDoc as any).title || citySlug
      }
    };
  }

  // 2. Two-segment location: /[country]/[state]/
  if (slugSegments.length === 2) {
    const fullSlug = `${countrySlug}/${stateSlug}`;
    const stateDoc = await Page.findOne({
      $or: [
        { slug: fullSlug },
        { slug: stateSlug }
      ],
      template: "state",
      status: "published",
      isTrashed: { $ne: true }
    }).lean();

    if (!stateDoc) {
      return { valid: false };
    }

    // Validate that parent Country exists
    const countryDoc = await Page.findOne({
      slug: countrySlug,
      template: "country",
      status: "published",
      isTrashed: { $ne: true }
    }).lean();

    if (!countryDoc) {
      return { valid: false };
    }

    return {
      valid: true,
      page: stateDoc,
      hierarchy: {
        countrySlug,
        countryName: countryDoc.title || "United States",
        stateSlug,
        stateName: (stateDoc as any).title || stateSlug
      }
    };
  }

  // 3. One-segment location: /[country]/
  if (slugSegments.length === 1) {
    const countryDoc = await Page.findOne({
      slug: countrySlug,
      template: "country",
      status: "published",
      isTrashed: { $ne: true }
    }).lean();

    if (countryDoc) {
      return {
        valid: true,
        page: countryDoc,
        hierarchy: {
          countrySlug,
          countryName: (countryDoc as any).title || "United States"
        }
      };
    }
  }

  return { valid: false };
}

/**
 * Builds breadcrumb trail for any location or standard page.
 */
export function buildLocationBreadcrumbs(page: any, slug: string): Array<{ name: string; url: string }> {
  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: "/" }
  ];

  if (!page) return crumbs;

  const template = page.template;
  const content = page.content || {};

  if (template === "city") {
    const countryName = content.country || "USA";
    const countrySlug = content.countrySlug || "usa";
    const stateName = content.state || "State";
    const stateSlug = content.stateSlug || "";
    const cityName = content.city || page.title;

    crumbs.push({ name: countryName, url: `/${countrySlug}/` });
    if (stateSlug) {
      crumbs.push({ name: stateName, url: `/${countrySlug}/${stateSlug}/` });
    }
    crumbs.push({ name: cityName, url: `/${page.slug}/` });
    return crumbs;
  }

  if (template === "state") {
    const countryName = content.country || "USA";
    const countrySlug = content.countrySlug || "usa";
    const stateName = page.title;

    crumbs.push({ name: countryName, url: `/${countrySlug}/` });
    crumbs.push({ name: stateName, url: `/${page.slug}/` });
    return crumbs;
  }

  if (template === "country") {
    crumbs.push({ name: page.title, url: `/${page.slug}/` });
    return crumbs;
  }

  // Default path-based crumbs for other pages
  const parts = (slug || page.slug || "").split("/").filter(Boolean);
  let accum = "";
  for (let i = 0; i < parts.length; i++) {
    accum += `/${parts[i]}`;
    const isLast = i === parts.length - 1;
    const name = isLast
      ? (page.seo?.breadcrumbTitle || page.title || parts[i])
      : parts[i].split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    crumbs.push({ name, url: `${accum}/` });
  }

  return crumbs;
}
