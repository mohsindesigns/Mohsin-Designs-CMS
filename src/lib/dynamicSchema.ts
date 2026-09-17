import { BASE_URL } from "./constants";
import { COUNTRIES_DATABASE } from "./countryLocations";

export interface SchemaContext {
  pageTitle?: string;
  pageSlug?: string;
  template?: string;
  metaDescription?: string;
  metaTitle?: string;
  ogImage?: string;
  content?: any;
  seo?: any;
  faqs?: Array<{ question?: string; answer?: string; q?: string; a?: string }>;
  globalSettings?: any;
}

/**
 * Normalizes and extracts location details (name, type, coordinates, state code)
 * from page content, template name, title, or slug.
 */
export function extractLocationInfo(
  slug: string = "",
  title: string = "",
  template: string = "",
  content: any = {}
): {
  name: string;
  type: "State" | "City" | "Country" | "AdministrativeArea";
  code?: string;
  latitude?: number;
  longitude?: number;
  country: string;
} {
  // 1. Check explicit content fields
  const rawLoc =
    content?.locationName ||
    content?.location ||
    content?.hero?.location ||
    content?.hero?.state ||
    content?.hero?.stateName ||
    content?.hero?.city ||
    content?.hero?.cityName ||
    content?.hero?.country ||
    "";

  let detectedName = typeof rawLoc === "string" ? rawLoc.trim() : "";

  // 2. If not in content, extract from slug or title
  if (!detectedName) {
    const slugParts = slug.split("/").filter(Boolean);
    const lastPart = slugParts[slugParts.length - 1] || "";

    // Clean up slug (e.g. "texas-web-design" -> "Texas", "georgia" -> "Georgia")
    const cleanLast = lastPart
      .replace(/-web-design|-web-development|-services|-agency/gi, "")
      .replace(/-/g, " ")
      .trim();

    if (cleanLast) {
      detectedName = cleanLast
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    } else if (title) {
      // Try from title (e.g. "Web Design in Texas" -> "Texas")
      const titleMatch = title.match(/\b(?:in|for|near|across)\s+([A-Za-z\s]+)/i);
      if (titleMatch && titleMatch[1]) {
        detectedName = titleMatch[1].trim();
      } else {
        detectedName = title.split("|")[0].split("-")[0].trim();
      }
    }
  }

  // Determine Type based on template or slug structure
  const lowerTemplate = (template || "").toLowerCase();
  let type: "State" | "City" | "Country" | "AdministrativeArea" = "AdministrativeArea";

  if (lowerTemplate.includes("state")) {
    type = "State";
  } else if (lowerTemplate.includes("city")) {
    type = "City";
  } else if (lowerTemplate.includes("country")) {
    type = "Country";
  } else {
    // Infer from slug
    if (slug.startsWith("city/") || slug.includes("/cities/")) {
      type = "City";
    } else if (slug.startsWith("state/") || slug.includes("/states/")) {
      type = "State";
    } else if (slug.startsWith("country/") || slug.includes("/countries/")) {
      type = "Country";
    }
  }

  // Look up coordinates and state code in COUNTRIES_DATABASE
  let latitude: number | undefined;
  let longitude: number | undefined;
  let code: string | undefined;
  const searchName = detectedName.toLowerCase();

  for (const [key, data] of Object.entries(COUNTRIES_DATABASE)) {
    const cleanKey = key.split(",")[0].trim().toLowerCase();
    if (
      cleanKey === searchName ||
      data.aliases.some((a) => a.toLowerCase() === searchName)
    ) {
      latitude = data.lat;
      longitude = data.lng;
      // Extract US state abbreviation if present in aliases
      const stateCodeAlias = data.aliases.find((a) => a.length === 2 && /^[a-z]{2}$/i.test(a));
      if (stateCodeAlias) code = stateCodeAlias.toUpperCase();
      break;
    }
  }

  return {
    name: detectedName || "United States",
    type,
    code,
    latitude,
    longitude,
    country: "US"
  };
}

/**
 * Builds the complete variable replacement map for a given page.
 */
export function buildSchemaVariableMap(
  page: any = {},
  globalData: any = {},
  slug: string = ""
): Record<string, string> {
  const cleanSlug = (slug || page.slug || "").replace(/^\/+|\/+$/g, "");
  const pageUrl = `${BASE_URL}/${cleanSlug ? cleanSlug + "/" : ""}`;
  const settings = globalData?.settings || {};

  const locationInfo = extractLocationInfo(
    cleanSlug,
    page.title || "",
    page.template || "",
    page.content || {}
  );

  const companyName = settings.siteName || settings.brandName || "Mohsin Designs";
  const companyPhone = settings.contactPhone || settings.phone || "+1 (614) 555-0192";
  const companyEmail = settings.contactEmail || settings.email || "contact@mohsindesigns.com";
  const pageTitle = page.seo?.metaTitle || page.title || "";
  const pageDesc =
    page.seo?.metaDescription ||
    page.content?.hero?.description ||
    page.content?.description ||
    "";
  const pageImg =
    page.seo?.ogImage ||
    page.seo?.featuredImage ||
    `${BASE_URL}/logo.png`;

  const serviceTitle =
    page.content?.hero?.titleIntro ||
    page.content?.hero?.titleHighlight ||
    page.title ||
    "Custom Web Development";

  const serviceCategory =
    page.content?.hero?.eyebrow ||
    page.content?.category ||
    "Digital Engineering";

  const industryName =
    page.content?.hero?.titleHighlight ||
    locationInfo.name ||
    page.title ||
    "Enterprise";

  return {
    // Page variables
    "page.title": pageTitle,
    "page.url": pageUrl,
    "page.description": pageDesc,
    "page.image": pageImg,
    "page.slug": cleanSlug,

    // Location variables
    "location.name": locationInfo.name,
    "location.type": locationInfo.type,
    "location.code": locationInfo.code || "",
    "location.latitude": locationInfo.latitude ? String(locationInfo.latitude) : "",
    "location.longitude": locationInfo.longitude ? String(locationInfo.longitude) : "",
    "location.country": locationInfo.country,

    // Service variables
    "service.title": serviceTitle,
    "service.category": serviceCategory,
    "service.description": pageDesc,
    "service.startingPrice": page.content?.pricing?.startingPrice || "1500",

    // Industry variables
    "industry.name": industryName,

    // Company / Site variables
    "company.name": companyName,
    "company.phone": companyPhone,
    "company.email": companyEmail,
    "site.name": companyName,
    "site.url": `${BASE_URL}/`,
    "site.logo": `${BASE_URL}/logo.png`,

    // Short alias variables
    "title": pageTitle,
    "url": pageUrl,
    "description": pageDesc,
    "location": locationInfo.name
  };
}

/**
 * Replaces {{variable}} tokens inside a raw schema string.
 * Escapes replacement strings safely to prevent breaking JSON strings.
 */
export function resolveDynamicSchemaTokens(
  rawSchema: string,
  variables: Record<string, string>
): string {
  if (!rawSchema || typeof rawSchema !== "string") return "";

  // Regex matches {{variable.name}} or {{ variable.name }}
  return rawSchema.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
    const val = variables[key.trim()];
    if (val === undefined || val === null) {
      return match; // keep if unknown
    }

    // JSON-escape quotes, newlines, and backslashes so JSON syntax is preserved
    return String(val)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  });
}

/**
 * Auto-generated schema has been removed per user instruction.
 * Only schemas explicitly added via the CMS Schema tab or synced from FAQs
 * should be rendered on any page.
 */
export function generateAutoSchemaForPage(
  _page: any = {},
  _globalData: any = {},
  _slug: string = ""
): any[] {
  return [];
}

/**
 * Main function called at render time. Resolves schemas for a page:
 * ONLY returns schema explicitly added by the user in the CMS Schema tab
 * and/or synced via "Sync FAQs to Schema".
 * Any dynamic {{variable}} tokens in the user's custom schema are resolved.
 * No auto schemas (Breadcrumbs, Place, Service, etc.) are injected.
 * Returns an array of JSON strings ready for <script type="application/ld+json">.
 */
export function getResolvedSchemaBlocks({
  page,
  globalData,
  slug
}: {
  page: any;
  globalData?: any;
  slug?: string;
}): string[] {
  if (!page) return [];

  const effectiveSlug = slug || page.slug || "";
  const varMap = buildSchemaVariableMap(page, globalData, effectiveSlug);

  const blocks: string[] = [];

  // 1. Schema explicitly entered by the user in the CMS Schema tab
  const rawCustomSchema =
    page.seo?.schemaData ||
    page.content?.schemaMarkup ||
    page.content?.customSchema ||
    page.schemaMarkup ||
    page.customSchema ||
    "";

  let customSchemaString = "";
  if (typeof rawCustomSchema === "string") {
    customSchemaString = rawCustomSchema.trim();
  } else if (rawCustomSchema && typeof rawCustomSchema === "object") {
    try {
      customSchemaString = JSON.stringify(rawCustomSchema);
    } catch {
      customSchemaString = "";
    }
  }

  if (customSchemaString.length > 0) {
    const resolved = resolveDynamicSchemaTokens(customSchemaString, varMap);
    blocks.push(resolved);
  }

  // 2. Synced FAQ schema (if stored in faqSchemaMarkup)
  const rawFaqSchema =
    page.faqSchemaMarkup ||
    page.content?.faqSchemaMarkup ||
    "";

  let faqSchemaString = "";
  if (typeof rawFaqSchema === "string") {
    faqSchemaString = rawFaqSchema.trim();
  } else if (rawFaqSchema && typeof rawFaqSchema === "object") {
    try {
      faqSchemaString = JSON.stringify(rawFaqSchema);
    } catch {
      faqSchemaString = "";
    }
  }

  if (faqSchemaString.length > 0) {
    const resolvedFaq = resolveDynamicSchemaTokens(faqSchemaString, varMap);
    // Only push if not already present in the custom schema block
    const alreadyPresent = blocks.some(
      (b) => b.includes(resolvedFaq) || (resolvedFaq.includes("FAQPage") && b.includes("FAQPage"))
    );
    if (!alreadyPresent) {
      blocks.push(resolvedFaq);
    }
  }

  return blocks;
}
