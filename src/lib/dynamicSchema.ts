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
 * Automatically builds an appropriate Schema.org JSON-LD structure for a page based on its
 * template, used ONLY as a fallback when the page has no manually-entered Schema tab markup (see
 * getResolvedSchemaBlocks) - manual entry always wins outright when present, this never merges
 * with it. Covers every template so no page type is ever left with zero structured data by
 * default: the location/service/industry/about/contact branches were restored from the version
 * removed in 4ffb49c (2026-09-17); home, blog and the catch-all default branch are new, since the
 * old version left those with nothing. Does NOT generate an inline FAQPage block (that stayed
 * removed) - FAQ schema is handled exclusively by the separate "Sync FAQs to Schema" feature
 * (faqSchemaMarkup), which getResolvedSchemaBlocks always appends on its own regardless of this.
 */
export function generateAutoSchemaForPage(
  page: any = {},
  globalData: any = {},
  slug: string = ""
): any[] {
  const cleanSlug = (slug || page.slug || "").replace(/^\/+|\/+$/g, "");
  const pageUrl = `${BASE_URL}/${cleanSlug ? cleanSlug + "/" : ""}`;
  const template = (page.template || "").toLowerCase();
  const settings = globalData?.settings || {};
  const companyName = settings.siteName || settings.brandName || "Mohsin Designs";
  const companyPhone = settings.contactPhone || settings.phone || "+1 (614) 555-0192";
  const companyEmail = settings.contactEmail || settings.email || "contact@mohsindesigns.com";
  const pageTitle = page.seo?.metaTitle || page.title || "";
  const pageDesc =
    page.seo?.metaDescription ||
    page.content?.hero?.description ||
    page.content?.description ||
    page.excerpt ||
    `${companyName} - ${pageTitle}`.trim();
  const pageImg = page.seo?.ogImage || page.featuredImage || `${BASE_URL}/logo.png`;

  // Fields only - no "@type" here, since every use site either wants "Organization" (spread it in
  // directly) or overlays its own more specific type (e.g. "ProfessionalService" as a provider) by
  // spreading these fields in AFTER setting its own "@type", so that one wins instead of this one.
  const organizationFields = {
    "name": companyName,
    "url": `${BASE_URL}/`,
    "logo": `${BASE_URL}/logo.png`,
    "telephone": companyPhone,
    "email": companyEmail
  };
  const organization = { "@type": "Organization", ...organizationFields };

  const schemas: any[] = [];

  if (template === "home" || cleanSlug === "") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": companyName,
      "url": `${BASE_URL}/`,
      "publisher": organization
    });
    schemas.push({ "@context": "https://schema.org", ...organization });
  } else if (
    template === "state" ||
    template === "city" ||
    template === "country" ||
    template === "location" ||
    template === "locations" ||
    template === "service-area"
  ) {
    const loc = extractLocationInfo(cleanSlug, pageTitle, template, page.content || {});
    const localBusinessSchema: any = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": `${companyName} - ${loc.name}`,
      "url": pageUrl,
      "description": pageDesc,
      "telephone": companyPhone,
      "email": companyEmail,
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": loc.country || "US",
        ...(loc.code ? { "addressRegion": loc.code } : {})
      },
      "areaServed": {
        "@type": loc.type,
        "name": loc.name
      },
      "provider": organization
    };

    if (loc.latitude && loc.longitude) {
      localBusinessSchema.geo = {
        "@type": "GeoCoordinates",
        "latitude": loc.latitude,
        "longitude": loc.longitude
      };
    }

    schemas.push(localBusinessSchema);
  } else if (template === "service-detail" || template === "services") {
    const serviceTitle = page.title || pageTitle;
    const serviceDesc = page.seo?.metaDescription || page.content?.hero?.description || pageDesc;
    const serviceSchema: any = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": serviceTitle,
      "serviceType": page.content?.hero?.eyebrow || page.content?.category || "Digital Engineering",
      "description": serviceDesc,
      "url": pageUrl,
      "provider": { "@type": "ProfessionalService", ...organizationFields, "priceRange": "$$" },
      "areaServed": { "@type": "Country", "name": "United States" }
    };

    if (page.createdAt) serviceSchema.datePublished = new Date(page.createdAt).toISOString();
    if (page.updatedAt) serviceSchema.dateModified = new Date(page.updatedAt).toISOString();

    schemas.push(serviceSchema);
  } else if (template === "industry" || template === "industries") {
    const industryName = page.content?.hero?.titleHighlight || pageTitle;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": pageTitle,
      "serviceType": `${industryName} Digital Solutions`,
      "category": industryName,
      "description": pageDesc,
      "url": pageUrl,
      "provider": { "@type": "ProfessionalService", ...organizationFields, "priceRange": "$$" }
    });
  } else if (template === "about" || template === "new-about" || template === "newabout") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": pageTitle,
      "description": pageDesc,
      "url": pageUrl,
      "mainEntity": organization
    });
  } else if (template === "contact") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": pageTitle,
      "description": pageDesc,
      "url": pageUrl,
      "mainEntity": organization
    });
  } else if (template === "blog" && page.publishedAt) {
    // The blog INDEX page is also stored with template "blog" (there's no separate "blog listing"
    // template), so this is additionally keyed on publishedAt - only an individual post's synthetic
    // page object (built in blogs/[slug]/page.tsx) carries that, not the index page's real Page doc.
    // Without it, the index page falls through to the generic WebPage branch below instead of being
    // incorrectly tagged as a single BlogPosting article.
    const publishedIso = page.publishedAt ? new Date(page.publishedAt).toISOString() : undefined;
    const modifiedIso = page.updatedAt ? new Date(page.updatedAt).toISOString() : publishedIso;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": pageTitle,
      "description": pageDesc,
      "image": pageImg,
      "url": pageUrl,
      ...(publishedIso ? { "datePublished": publishedIso } : {}),
      ...(modifiedIso ? { "dateModified": modifiedIso } : {}),
      "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
      "author": { "@type": "Person", "name": page.authorName || companyName },
      "publisher": {
        "@type": "Organization",
        "name": companyName,
        "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` }
      }
    });
  } else {
    // Catch-all for every other template (team, careers, gallery, reviews, FAQ, etc.) so no page
    // type is ever left with zero structured data when nothing was manually entered.
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageTitle,
      "description": pageDesc,
      "url": pageUrl,
      "isPartOf": { "@type": "WebSite", "name": companyName, "url": `${BASE_URL}/` }
    });
  }

  // BreadcrumbList for every non-home page, regardless of template.
  if (cleanSlug) {
    const segments = cleanSlug.split("/").filter(Boolean);
    const breadcrumbItems: any[] = [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` }
    ];

    let runningPath = "";
    segments.forEach((seg: string, idx: number) => {
      runningPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const segTitle = isLast
        ? (page.title || pageTitle)
        : seg
            .replace(/-/g, " ")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

      breadcrumbItems.push({
        "@type": "ListItem",
        "position": idx + 2,
        "name": segTitle,
        "item": `${BASE_URL}${runningPath}/`
      });
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    });
  }

  return schemas;
}

/**
 * Main function called at render time. Resolves schemas for a page:
 * 1. Schema entered by the user in the CMS Schema tab, if any - {{variable}} tokens resolved.
 * 2. FAQ schema synced via "Sync FAQs to Schema", if any - always included regardless of (1) or
 *    (3), since it's its own deliberate opt-in action, not "auto" schema.
 * 3. ONLY when (1) is empty: template-appropriate auto-generated schema (see
 *    generateAutoSchemaForPage) - a fallback for pages where nothing was manually entered, never
 *    merged with manual schema. Manual entry always fully replaces the auto fallback when present.
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
    // Only skip it if it's genuinely already present verbatim in the custom
    // schema block (e.g. the same generated JSON got pasted into both
    // fields). A coarser "both mention FAQPage" check would silently drop
    // the live, correct FAQ schema any time the custom block happens to
    // contain an unrelated FAQPage entry (e.g. a hand-written @graph) -
    // that's a false suppression of real structured data, not a duplicate.
    const alreadyPresent = blocks.some((b) => b.includes(resolvedFaq));
    if (!alreadyPresent) {
      blocks.push(resolvedFaq);
    }
  }

  // 3. No manual schema was entered - fall back to the template-appropriate auto-generated
  // schema, so a page is never left with zero structured data just because no one filled in the
  // Schema tab. Gated strictly on the manual field being empty (not on `blocks` being empty),
  // so this still fires even when only the FAQ sync has content - FAQ schema and a page's primary
  // entity/breadcrumb schema are complementary, not competing.
  if (customSchemaString.length === 0) {
    const autoSchemas = generateAutoSchemaForPage(page, globalData, effectiveSlug);
    for (const s of autoSchemas) {
      try {
        blocks.push(JSON.stringify(s));
      } catch {
        // Skip anything that somehow fails to serialize rather than breaking the whole page.
      }
    }
  }

  return blocks;
}
